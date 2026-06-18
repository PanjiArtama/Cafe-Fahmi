import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true, default: "gram" }, // gram, ml, pcs
    status: { type: Boolean, default: true },
});

export default mongoose.model('Material', MaterialSchema);
