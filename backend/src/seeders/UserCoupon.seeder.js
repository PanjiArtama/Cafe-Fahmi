import UserCoupon from "../models/UserCoupon.js";

const SeedUserCoupon = async (users, coupons) => {
    const userMap = {
        user1: users[0],
        user2: users[1],
    };

    const couponMap = {
        disc10: coupons.find(c => c.code === "DISC10"),
        disc20: coupons.find(c => c.code === "DISC20"),
        fixed5k: coupons.find(c => c.code === "FIXED5K"),
        expired: coupons.find(c => c.code === "EXPIRED10"),
    };

    const userCoupons = await UserCoupon.insertMany([
        // ✅ UNUSED coupons
        {
            userId: userMap.user1._id,
            couponId: couponMap.disc10._id,
            isUsed: false
        },
        {
            userId: userMap.user1._id,
            couponId: couponMap.fixed5k._id,
            isUsed: false
        },

        // ✅ USED coupon
        {
            userId: userMap.user1._id,
            couponId: couponMap.disc20._id,
            isUsed: true,
            usedAt: new Date()
        },

        // ✅ Another user (unused)
        {
            userId: userMap.user2._id,
            couponId: couponMap.disc10._id,
            isUsed: false
        },

        // ✅ Expired coupon (still assigned, but unusable)
        {
            userId: userMap.user2._id,
            couponId: couponMap.expired._id,
            isUsed: false
        }
    ]);

    console.log(`${userCoupons.length} UserCoupons seeded!`);
    return userCoupons;
};

export default SeedUserCoupon;