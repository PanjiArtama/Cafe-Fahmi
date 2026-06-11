import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const LoginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await User.findOne({ username, role: "admin" });
        if (!admin) return res.status(401).json({ message: "Invalid User" });

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign(
            { id: admin._id, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid User" });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: false },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );
        res.json({ token: token, user: { id: user._id, username: user.username, email: user.email, phone: user.phone } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const Register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;
        const existingUser = await User.findOne({
            email: email
        });
        function isValidSyntax(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (!isValidSyntax(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone
        });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}