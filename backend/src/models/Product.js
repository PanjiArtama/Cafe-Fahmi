import mongoose from "mongoose";

const Product = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    desc : { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image : { type: String },
    composition: [{
        materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
        quantity: { type: Number, required: true }
    }],
    status : { type: Boolean, default: true },
});

export default mongoose.model('Product', Product);