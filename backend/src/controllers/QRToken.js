import QRCode from "qrcode";
import crypto from "crypto";
import QRToken from "../models/QRToken.js";

export const getUserQR = async (req, res) => {
    try {
        const userId = req.user.id;
        let qrToken = await QRToken.findOne({ userId });
        if (!qrToken) {
            const token = crypto.randomBytes(32).toString("hex");

            qrToken = await QRToken.create({
                userId,
                token
            });
        }
        const url = `http://localhost:5005/qr/verify?token=${qrToken.token}`;

        const qrImage = await QRCode.toDataURL(url);

        res.json({
            qr: qrImage,
            token: qrToken.token
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const verifyQR = async (req, res) => {
    try {
        const { token } = req.query;
        const qrToken = await QRToken.findOne({ token }).populate({path: "userId", select: "-password"});
        if (!qrToken) {
            return res.status(404).json({ message: "Invalid QR" });
        }
        res.json({
            user: qrToken.userId
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};