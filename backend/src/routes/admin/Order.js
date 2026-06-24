import express from "express";
import {
    createOrder,
    changeStatus,
    getOrders,
    getOrderHistory,
    getOrderStats,
    getOrderById,
    getOrdersByUser,
    getOrdersByRange,
    downloadExcelReport,
    getDailyStats
} from "../../controllers/Order.js";
import { isAdmin } from "../../middleware/auth.js";

const AdminOrder = express.Router();

AdminOrder.get("/get", isAdmin, getOrders);
AdminOrder.get("/history", isAdmin, getOrderHistory);
AdminOrder.get("/stats", isAdmin, getOrderStats);
AdminOrder.get("/getReportByRange", isAdmin, downloadExcelReport);
AdminOrder.put("/getByRange", isAdmin, getOrdersByRange);
AdminOrder.get("/getDailyStats", isAdmin, getDailyStats);
AdminOrder.post("/add", isAdmin, createOrder);
AdminOrder.get("/get/:id", isAdmin, getOrderById);
AdminOrder.patch("/update/:id/status", isAdmin, changeStatus);

export default AdminOrder;
