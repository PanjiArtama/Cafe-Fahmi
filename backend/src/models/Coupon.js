import mongoose from "mongoose";

const Coupon = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { 
        type: String, 
        enum: ['percentage', 'fixed'], 
        required: true 
    },

    value: { type: Number, required: true },

    maxDiscount: { type: Number },
    minPurchase: { type: Number, default: 0 },

    expiresAt: { type: Date },
    
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Coupon', Coupon);