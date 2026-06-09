import app from "./src/app.js";
import "dotenv/config";
import mongoose from "mongoose";
const PORT = process.env.PORT || 5005;
const NODE_ENV = process.env.NODE_ENV || "development";
const DB_URI = process.env.DB_URI;
const mongoURI = DB_URI; 
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Successfully connected to MongoDB! 🚀');
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
});
