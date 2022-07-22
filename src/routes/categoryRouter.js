import { Router } from "express";
import { getCategories, addCategory } from "../controllers/categoryController.js";

const categoryRouter = Router();

categoryRouter.get("/categories", getCategories);
categoryRouter.post("/categories", addCategory);

export default categoryRouter;