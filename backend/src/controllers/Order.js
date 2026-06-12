import Order from "../models/Order.js";
import OrderDetail from "../models/OrderDetail.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import UserCoupon from "../models/UserCoupon.js";
import { generateOrdersExcel } from "../utils/excelGenerator.js";

export const createOrder = async (req, res) => {
    try {
        const { userId, items, guestName, couponCode } = req.body;
        if (!items || items.length === 0 || (!userId && !guestName)) {
            return res.status(400).json({ message: "Invalid data" });
        }
        let subtotalAmount = 0;
        const orderDetailIds = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            const subtotal = item.price * item.quantity;
            subtotalAmount += subtotal;

            const orderDetail = await OrderDetail.create({
                productId: product._id,
                quantity: item.quantity,
                price: item.price,
            });

            orderDetailIds.push(orderDetail._id);
        }

        let discountAmount = 0;
        let couponId = null;


        if (couponCode && userId) {
            const coupon = await Coupon.findOne({ code: couponCode });

            if (!coupon || !coupon.isActive) {
                return res.status(400).json({ message: "Invalid coupon" });
            }

            if (coupon.expiresAt && coupon.expiresAt < new Date()) {
                return res.status(400).json({ message: "Coupon expired" });
            }

            if (subtotalAmount < coupon.minPurchase) {
                return res.status(400).json({ message: "Minimum purchase not reached" });
            }


            const userCoupon = await UserCoupon.findOne({
                userId,
                couponId: coupon._id,
                isUsed: false
            });

            if (!userCoupon) {
                return res.status(403).json({ message: "Coupon not assigned to user" });
            }

            if (userCoupon.isUsed) {
                return res.status(400).json({ message: "Coupon already used" });
            }


            if (coupon.type === "percentage") {
                discountAmount = (subtotalAmount * coupon.value) / 100;

                if (coupon.maxDiscount) {
                    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
                }
            } else {
                discountAmount = coupon.value;
            }

            couponId = coupon._id;


            userCoupon.isUsed = true;
            userCoupon.usedAt = new Date();
            await userCoupon.save();
        }

        const totalAmount = subtotalAmount - discountAmount;

        const order = await Order.create({
            userId,
            guestName,
            subtotalAmount,
            discountAmount,
            totalAmount,
            couponId,
            orderDetails: orderDetailIds,
        });

        res.status(201).json(order);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['processing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status, orderDate: new Date() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({
        })
            .sort({ orderDate: -1 }) // Sorts by orderDate, newest first
            .populate({
                path: "userId",
                select: "-password"
            })
            .populate({
                path: "orderDetails",
                populate: { path: "productId" }
            });

        res.json(orders);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: "userId",
                select: "-password"
            })
            .populate("couponId")
            .populate({
                path: "orderDetails",
                populate: { path: "productId" }
            });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ userId })
            .populate({
                path: "orderDetails",
                populate: { path: "productId" }
            })
            .sort({ orderDate: -1 });

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        res.json(orders);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getOrdersByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Please provide both startDate and endDate" });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            orderDate: { $gte: start, $lte: end }
        })
            .populate('userId', 'username email')
            .populate({
                path: 'orderDetails',
                populate: { path: 'productId', select: 'name' }
            })
            .sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const downloadExcelReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Get from URL params
        // Fallback to today if no dates provided
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        const orders = await Order.find({
            orderDate: { $gte: start, $lte: end }
        })
            .populate('userId', 'username')
            .populate({
                path: 'orderDetails',
                populate: { path: 'productId', select: 'name' }
            })
            .sort({ orderDate: -1 });

        const filename = `Orders_Report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}`;
        // Call the utility function we made earlier
        await generateOrdersExcel(orders, res, filename);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const getDailyStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const stats = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: startOfDay, $lte: endOfDay },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalDiscount: { $sum: "$discountAmount" },
                    totalSubtotal: { $sum: "$subtotalAmount" }
                }
            }
        ]);
        const result = stats.length > 0 ? stats[0] : {
            totalOrders: 0,
            totalRevenue: 0,
            totalDiscount: 0,
            totalSubtotal: 0
        };

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};