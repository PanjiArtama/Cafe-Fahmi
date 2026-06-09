import express from "express";
import {
    getOrdersByUser
} from "../../controllers/Order.js";
import { isUser } from "../../middleware/auth.js";

const UserOrder = express.Router();

UserOrder.get("/", isUser, getOrdersByUser);

export default UserOrder;
