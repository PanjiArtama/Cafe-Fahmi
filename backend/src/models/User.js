import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true},
    email : { type: String, required: true, unique: true },
    phone : { type: String, required: true },
    role : { type: String, enum: ['user', 'admin'], default: 'user' },
    password: { type: String, required: true },
});

export default mongoose.model('User', UserSchema);