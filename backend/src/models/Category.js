import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    status : { type: Boolean, default: true },
});

export default mongoose.model('Category', CategorySchema);