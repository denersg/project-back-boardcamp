import { Router } from "express";
import { getRentals, addRental, finalizeRent, deleteRentalById } from "../controllers/rentalController.js";

const rentalRouter = Router();

rentalRouter.get("/rentals", getRentals);
rentalRouter.post("/rentals", addRental);
rentalRouter.post("/rentals/:id/return", finalizeRent);
rentalRouter.delete("/rentals/:id", deleteRentalById);

export default rentalRouter;