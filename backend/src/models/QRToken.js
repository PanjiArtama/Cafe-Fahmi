import mongoose from "mongoose";

const QRTokenSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        unique: true // 🔥 IMPORTANT: 1 user = 1 QR
    },

    token: { 
        type: String, 
        required: true, 
        unique: true 
    },

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("QRToken", QRTokenSchema);