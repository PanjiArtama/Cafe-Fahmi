import express from "express";
import { getAllUsers, getAllUsersStats, getUserById } from "../../controllers/User.js";
import { isAdmin } from "../../middleware/auth.js";

const AdminUser = express.Router();

AdminUser.get("/get", isAdmin, getAllUsers);
AdminUser.post("/getStat", isAdmin, getAllUsersStats);
AdminUser.get("/get/:id", isAdmin, getUserById);

export default AdminUser;