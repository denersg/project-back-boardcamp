import { Router } from "express";
import { getCustomers, getCustomerById, addCustomer, updateCustomer } from "../controllers/customerController.js";

const customerRouter = Router();

customerRouter.get("/customers", getCustomers);
customerRouter.get("/customers", getCustomerById);
customerRouter.post("/customers", addCustomer);
customerRouter.put("/customers", updateCustomer);

export default customerRouter;