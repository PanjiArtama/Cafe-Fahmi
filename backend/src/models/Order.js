import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    guestName: { type: String },

    orderDate: { type: Date, default: Date.now },

    totalAmount: { type: Number, required: true },
    subtotalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },

    orderDetails: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderDetail'
    }],

    status: {
        type: String,
        enum: ['processing', 'completed', 'cancelled'],
        default: 'processing'
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', OrderSchema);