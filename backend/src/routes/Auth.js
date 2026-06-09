import express from "express";
import { LoginAdmin, Login, Register } from "../controllers/Auth.js";

const Auth = express.Router();

//login admin
Auth.post("/login-admin", LoginAdmin)

//auth user
Auth.post("/login", Login)
Auth.post("/register", Register)

export default Auth;