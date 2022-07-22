import { Router } from "express"
import { getGames, addGame } from "../controllers/gameController.js";

const gameRouter = Router();

gameRouter.get("/games", getGames);
gameRouter.post("/games", addGame);

export default gameRouter;