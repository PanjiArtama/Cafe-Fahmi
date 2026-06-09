import mongoose from "mongoose";
import "dotenv/config";
const DB_URI = process.env.DB_URI;
const mongoURI = DB_URI; 
export const connectDB = async () => {
    await mongoose.connect(mongoURI);
};

export const resetDB = async () => {
    await mongoose.connection.dropDatabase();
    console.log('Database dropped');
};