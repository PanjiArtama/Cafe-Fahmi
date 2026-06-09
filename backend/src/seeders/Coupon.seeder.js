import Coupon from "../models/Coupon.js";

const SeedCoupon = async () => {
    const coupons = await Coupon.insertMany([
        {
            code: "DISC10",
            type: "percentage",
            value: 10,
            maxDiscount: 20000,
            minPurchase: 50000,
            isActive: true
        },
        {
            code: "DISC20",
            type: "percentage",
            value: 20,
            maxDiscount: 30000,
            minPurchase: 80000,
            isActive: true
        },
        {
            code: "FIXED5K",
            type: "fixed",
            value: 5000,
            minPurchase: 20000,
            isActive: true
        },
        {
            code: "EXPIRED10",
            type: "percentage",
            value: 10,
            maxDiscount: 10000,
            minPurchase: 30000,
            isActive: true,
            expiresAt: new Date("2023-01-01") // expired
        },
        {
            code: "INACTIVE",
            type: "fixed",
            value: 10000,
            minPurchase: 50000,
            isActive: false
        }
    ]);

    console.log(`${coupons.length} Coupons seeded!`);
    return coupons;
};

export default SeedCoupon;