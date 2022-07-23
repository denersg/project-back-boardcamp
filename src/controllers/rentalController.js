import dayjs from "dayjs";
import db from "../db.js";
import rentalSchema from "../schemas/rentalSchema.js";

export async function getRentals(req, res){
    const { customerId, gameId } = req.query;
    const queryCommandText = `
        SELECT
            rentals.*, customers.name, games.name, categories.* 
        FROM
            rentals
        JOIN
            customers ON customers.id=rentals."customerId"
        JOIN
            games ON games.id=rentals."gameId"
        JOIN
            categories ON categories.id=games."categoryId"
    `;

    try{
        const queryParams = [];
        let where = "";

        if(customerId){
            queryParams.push(customerId);
            where += `WHERE rentals."customerId"=$${queryParams.length}`;
        }
        if(gameId){
            queryParams.push(gameId);
            where += `WHERE rentals."gameId"=$${queryParams.length}`;
        }

        const result = await db.query({
            text: `
                    ${queryCommandText}
                    ${where}`,
            rowMode: "array"
        }, queryParams);

        res.status(200).send(result.rows.map((e) => {
            const [
                id, customerId, gameId, rentDate, daysRented,
                returnDate, originalPrice, delayFee, customerName,
                gameName, categoryId, categoryName
            ] = e;

            return(
                {
                    id,
                    customerId,
                    gameId,
                    rentDate,
                    daysRented,
                    rentDate,
                    originalPrice,
                    delayFee,
                    customer: {
                        id: customerId,
                        name: customerName
                    },
                    game: {
                        id: gameId,
                        name: gameName,
                        categoryId,
                        categoryName
                    }
                }
            )
        }));
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function addRental(req, res){
    try{
        const rental = req.body;
        const validation = rentalSchema.validate(rental);
        if(validation.error){
            return res.sendStatus(400);
        }

        const isCustomerExisting = await db.query("SELECT id FROM customers WHERE id=$1", [rental.customerId]);
        if(isCustomerExisting.rowCount == 0){
            return res.sendStatus(400);
        }

        const isGameExisting = await db.query("SELECT * FROM games WHERE id=$1", [rental.gameId]);
        if(isGameExisting.rowCount == 0){
            return res.sendStatus(400);
        }
        const gameResult = isGameExisting.rows[0];

        //Valida jogos disponíveis
        const result = await db.query(`
            SELECT
                id
            FROM
                rentals
            WHERE
                "gameId"=$1 AND "returnDate" IS null
        `, [rental.gameId]);

        //Valida estoque
        if(result.rowCount > 0){
            if(gameResult.stockTotal == result.rowCount){
                return res.sendStatus(400);
            }
        }

        const originalPrice = (rental.daysRented)*(gameResult.pricePerDay);

        await db.query(`
            INSERT INTO
                rentals(
                    "customerId", "gameId", "rentDate", "daysRented",
                    "returnDate", "originalPrice", "delayFee"
                )
            VALUES ($1, $2, NOW(), $3, null, $4, null)
        `, [
            rental.customerId, rental.gameId,
            rental.daysRented, originalPrice
        ]);

        res.sendStatus(201);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function finalizeRent(req, res){
    const { id } = req.params;

    try{
        const isRentalExisting = await db.query(`
            SELECT * FROM rentals WHERE id=$1
        `, [id]);
        if(isRentalExisting == 0){
            return res.sendStatus(404);
        }

        const [rental] = isRentalExisting.rows;
        //Em caso de aluguel já finalizado
        if(rental.returnDate){
            return res.sendStatus(400);
        }

        //Validação de dias de atraso
        const dateOfReturn = dayjs(rental.rentDate).add(rental.daysRented, "day");
        const date1 = dayjs();
        const calcDaysDifference = dayjs(date1).diff(dateOfReturn, "days");
        const calcPricePerDayDelay = (rental.originalPrice / rental.daysRented);

        let delayFee;
        if(delayFee > 0){
            delayFee = (calcPricePerDayDelay) * (calcDaysDifference);
        }

        await db.query(`
            UPDATE
                rentals
            SET
                "returnDate"=NOW(), "delayFee"=$1
            WHERE
                id=$2
        `, [delayFee, id]);

        res.sendStatus(200);
    }
    catch{
        console.log(e);
        res.sendStatus(500);
    }
}

export async function deleteRentalById(req, res){
    const { id } = req.params;

    try{
        const isRentalExists = await db.query(`
            SELECT * FROM rentals WHERE id=$1
        `, [id]);
        if(isRentalExists.rows == 0){
            return res.sendStatus(404);
        }

        const [rental] = isRentalExists.rows;
        if(rental.returnDate){
            return res.sendStatus(400);
        }

        await db.query("DELETE FROM rentals WHERE id=$1", [id]);
        res.sendStatus(200);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}