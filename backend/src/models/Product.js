import mongoose from "mongoose";

const Product = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    desc : { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image : { type: String },
    isAvailable : { type: Boolean, default: true },
    status : { type: Boolean, default: true },
});

export default mongoose.model('Product', Product);