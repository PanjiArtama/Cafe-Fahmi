import express from "express";
import { getUserCoupons } from "../../controllers/UserCoupons.js";
import { isUser } from "../../middleware/auth.js";

const UserCoupon = express.Router();

UserCoupon.get("/get", isUser, getUserCoupons);

export default UserCoupon;