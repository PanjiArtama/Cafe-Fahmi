import mongoose from "mongoose";

const MaterialHistorySchema = new mongoose.Schema({
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true
    },
    transactionType: {
        type: String,
        enum: ['IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'ORDER'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousStock: {
        type: Number,
        required: true
    },
    currentStock: {
        type: Number,
        required: true
    },
},
    { timestamps: true });

export default mongoose.model('MaterialHistory', MaterialHistorySchema);