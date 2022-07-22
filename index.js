import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import router from "./src/routes/index.js";

dotenv.config();

const app = express();//Cria o servidor
app.use(cors());
app.use(json());

app.listen(process.env.PORT, () => {
    const serverOn = chalk.hex("#F76916");
    console.log(serverOn.bold("Server de pé na porta " + process.env.PORT));
});