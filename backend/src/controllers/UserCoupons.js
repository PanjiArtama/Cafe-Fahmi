import UserCoupon from "../models/UserCoupon.js";

export const getUserCoupons = async (req, res) => {
    try {
        const userCoupons = await UserCoupon.find({ userId: req.user.id, isUsed:false }).populate('couponId');
        res.json(userCoupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}