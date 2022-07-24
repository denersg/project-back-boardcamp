import db from "../db.js";
import categorySchema from "../schemas/categorySchema.js";

export async function getCategories(req, res){
    try{
        const result = await db.query("SELECT * FROM categories");
        res.status(200).send(result.rows);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function addCategory(req, res){
    try{
        const category = req.body;
        const validation = categorySchema.validate(category);
        if(validation.error){
            return res.sendStatus(400);
        }

        const categoryAlreadyExists = await db.query("SELECT id FROM categories WHERE name=$1", [category.name]);
        if(categoryAlreadyExists.rowCount > 0){
            return res.sendStatus(409);
        }

        await db.query("INSERT INTO categories(name) VALUES ($1)", [category.name]);

        res.sendStatus(201);
    }
    catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}