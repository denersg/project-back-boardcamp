import db from "../db.js";
import customerSchema from "../schemas/customerSchema.js";

export async function getCustomers(req, res){
    const { cpf } = req.query;

    try{
        const queryParams = [];
        let where = "";
        
        //Se houver busca por 'cpf', adiciona no final da query de seleção.
        if(cpf){
            queryParams.push(`${cpf}%`);
            where += `WHERE cpf ILIKE $${queryParams.length}`;
        }

        const result = await db.query(`
            SELECT * FROM customers ${where}
        `, queryParams);
        res.status(200).send(result.rows);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function getCustomerById(req, res){
    const { id } = req.params;

    try{
        const isCustomerExists = await db.query(`
            SELECT * FROM customers WHERE id=$1
        `, [id]);

        if(isCustomerExists.rowCount === 0){
            return res.sendStatus(404);
        }

        res.status(200).send(isCustomerExists.rows[0]);
    }
    catch(error){
        console.log(e);
        res.sendStatus(500);
    }
}

export async function addCustomer(req, res){
    try{
        const customer = req.body;
        const validation = customerSchema.validate(customer);
        if(validation.error){
            return res.sendStatus(400);
        }

        const customerExists = await db.query("SELECT id FROM customers WHERE cpf=$1", [customer.cpf]);
        if(customerExists.rowCount > 0){
            return res.sendStatus(409);
        }

        await db.query(`
            INSERT INTO
                customers(name, phone, cpf, birthday)
            VALUES ($1, $2, $3, $4)
        `, [customer.name, customer.phone, customer.cpf, customer.birthday]);

        res.sendStatus(201);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function updateCustomer(req, res){
    const { id } = req.params;

    try{
        const customer = req.body;
        const validation = customerSchema.validate(customer);
        if(validation.error){
            return res.sendStatus(400);
        }

        const customerExists = await db.query(`
            SELECT id
            FROM customers
            WHERE cpf=$1 AND id!=$2
        `, [customer.cpf, id]);
        if(customerExists.rowCount > 0){
            return res.sendStatus(409);
        }

        await db.query(`
            UPDATE customers
            SET name=$1, phone=$2, cpf=$3, birthday=$4
            WHERE id=$5
        `, [customer.name , customer.phone , customer.cpf , customer.birthday]);

        res.sendStatus(200);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}