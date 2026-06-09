import cors from "cors";

import express from 'express'
import path from "path"
import cookieParser from "cookie-parser";
import Auth from "./routes/Auth.js";
import AdminCat from "./routes/Admin/Category.js";
import AdminProduct from "./routes/Admin/Product.js";
import AdminUser from "./routes/Admin/User.js";
import PublicCat from "./routes/Public/Category.js";
import PublicProduct from "./routes/Public/Product.js";
import AdminOrder from "./routes/admin/Order.js";
import UserOrder from "./routes/user/Order.js";
import QRRoute from './routes/QRToken.js'
import AdminCoupons from "./routes/admin/Coupon.js";
import UserCoupon from "./routes/user/UserCoupon.js";
import UserRoute from "./routes/user/UserRoute.js";
import AdminWebInfo from "./routes/admin/WebInformation.js";
import PublicWebInfo from "./routes/public/WebInformation.js";

const app = express()
const __dirname = path.resolve();
app.use(cookieParser())
app.use(
  cors({
    origin: "*",
    credentials: true,
  }));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//picture
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//auth Route
app.use("/auth", Auth)

//admin Route
app.use("/admin/coupon", AdminCoupons)
app.use("/admin/cat", AdminCat)
app.use("/admin/product", AdminProduct)
app.use("/admin/user", AdminUser)
app.use("/admin/order", AdminOrder)
app.use("/admin/web-info", AdminWebInfo)

//user Route
app.use("/user/order", UserOrder)
app.use("/user/coupon", UserCoupon)
app.use("/user/profile", UserRoute)

//qr Route
app.use('/qr', QRRoute)

//public Route
app.use("/cat", PublicCat)
app.use("/product", PublicProduct)
app.use("/web-info", PublicWebInfo)

export default app;