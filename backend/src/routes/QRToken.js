import express from "express";
import { getUserQR, verifyQR } from "../controllers/QRToken.js";
import { isUser } from "../middleware/auth.js";

const QRRoute = express.Router();

QRRoute.get("/", isUser, getUserQR);

QRRoute.get("/verify", verifyQR);

export default QRRoute;