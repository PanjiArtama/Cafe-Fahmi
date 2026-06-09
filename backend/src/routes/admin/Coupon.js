import express from "express";
import {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    toggleCouponStatus,
    deleteCoupon,
    assignCouponToUsers,
    getCouponByUser,
    getAvailableCoupons
} from "../../controllers/Coupons.js";

import { isAdmin } from "../../middleware/auth.js";

const AdminCoupons = express.Router();

AdminCoupons.post("/add", isAdmin, createCoupon);
AdminCoupons.get("/get", isAdmin, getCoupons);
AdminCoupons.get("/getAvailable", isAdmin, getAvailableCoupons);
AdminCoupons.get("/getByUser/:id", isAdmin, getCouponByUser);
AdminCoupons.get("/get/:id", isAdmin, getCouponById);
AdminCoupons.put("/update/:id", isAdmin, updateCoupon);
AdminCoupons.patch("/toggle/:id", isAdmin, toggleCouponStatus);
AdminCoupons.delete("/delete/:id", isAdmin, deleteCoupon);
AdminCoupons.post("/assign", isAdmin, assignCouponToUsers);

export default AdminCoupons;