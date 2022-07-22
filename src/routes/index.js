import { Router } from "express";
import categoryRouter from "./categoryRouter.js";
import customerRouter from "./customerRouter.js";
import gameRouter from "./gameRouter.js";

const router = Router();

router.use(categoryRouter);
router.use(customerRouter);
router.use(gameRouter);

export default router;