import Coupon from "../models/Coupon.js";
import UserCoupon from "../models/UserCoupon.js";


export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            type,
            value,
            maxDiscount,
            minPurchase,
            desc,
            isActive,
            expiresAt
        } = req.body;

        const coupon = await Coupon.create({
            code,
            type,
            desc,
            value,
            maxDiscount,
            minPurchase,
            isActive,
            expiresAt
        });

        res.status(201).json(coupon);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCouponByUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userCoupons = await UserCoupon.find({ userId: userId, isUsed: false })
            .populate({
                path: "couponId",
            })
            .sort({ createdAt: -1 });
        const validCoupons = userCoupons.filter(uc => {
            if (!uc.couponId.expiresAt) return true;
            return uc.couponId.expiresAt > new Date();
        });

        res.json(validCoupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAvailableCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({
            isActive: true, $or: [
                { expiresAt: { $gte: new Date() } },
                { expiresAt: { $exists: false } },
                { expiresAt: null }
            ]
        }).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.json(coupon);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const {_id} = req.body;
        req.body.code = req.body.code.toUpperCase();
        const coupon = await Coupon.findByIdAndUpdate(
            _id,
            req.body,
            { new: true }
        );

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.json(coupon);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json(coupon);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.json({ message: "Coupon deleted" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const assignCouponToUsers = async (req, res) => {
    try {
        const { couponId, userIds } = req.body;

        if (!couponId || !userIds || userIds.length === 0) {
            return res.status(400).json({ message: "Invalid data" });
        }
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        if (coupon.isActive === false) {
            return res.status(400).json({ message: "Cannot assign inactive coupon" });
        }

        const data = userIds.map(userId => ({
            userId,
            couponId
        }));

        const result = await UserCoupon.insertMany(data, { ordered: false });

        res.status(201).json({
            message: "Coupons assigned",
            data: result
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};