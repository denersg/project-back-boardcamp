import db from "../db.js";
import gameSchema from "../schemas/gameSchema.js";

export async function getGames(req, res){
    const { name } = req.query;

    try{
        const queryParams = [];
        let where = "";

        //Se houver busca por 'nome', adiciona no final da query de seleção.
        if(name){
            queryParams.push(`${name}`);
            where += `WHERE games.name ILIKE $${queryParams.length}`;
        }

        const result = await db.query(`
            SELECT
                games.*, categories.name AS "categoryName"
            FROM games
            JOIN categories ON categories.id=games."categoryId"
            ${where}
        `, queryParams);        
        res.status(200).send(result.rows);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function addGame(req, res){
    try{
        const game = req.body;
        const validation = gameSchema.validate(game);
        if(validation.error){
            return res.sendStatus(400);
        }

        const categoryExists = await db.query("SELECT id FROM categories WHERE id=$1", [game.categoryId]);
        if(categoryExists.rowCount === 0){
            return res.sendStatus(400);
        }

        await db.query(`
        INSERT INTO
            games(name, image, "stockTotal", "categoryId", "pricePerDay")
        VALUES
            ($1, $2, $3, $4, $5)
        `, [game.name, game.image, game.stockTotal, game.categoryId, game.pricePerDay]);

        res.sendStatus(201);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}