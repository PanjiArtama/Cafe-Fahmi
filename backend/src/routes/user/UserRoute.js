import express from "express";
import { getProfile, updateProfile } from "../../controllers/User.js";
import { isUser } from "../../middleware/auth.js";
import User from "../../models/User.js";

const UserRoute = express.Router();

UserRoute.get("/", isUser, getProfile);
UserRoute.put("/update", isUser, updateProfile)
export default UserRoute;
