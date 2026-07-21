import mongoose from "mongoose";

const UserCoupon = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    couponId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Coupon', 
        required: true 
    },

    isUsed: { type: Boolean, default: false },

    usedAt: { type: Date, default: null },

    assignedAt: { type: Date, default: Date.now }
});

// UserCoupon.index({ userId: 1, couponId: 1 }, { unique: true });

export default mongoose.model('UserCoupon', UserCoupon);