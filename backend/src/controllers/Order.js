import Order from "../models/Order.js";
import OrderDetail from "../models/OrderDetail.js";
import Product from "../models/Product.js";
import Material from "../models/Material.js";
import Coupon from "../models/Coupon.js";
import UserCoupon from "../models/UserCoupon.js";
import { generateOrdersExcel } from "../utils/excelGenerator.js";

export const createOrder = async (req, res) => {
    try {
        const { userId, items, guestName, couponCode } = req.body;
        if (!items || items.length === 0 || (!userId && !guestName)) {
            return res.status(400).json({ message: "Invalid data" });
        }

        // 1. Check material availability for all items before proceeding
        for (const item of items) {
            const product = await Product.findById(item.productId).populate("composition.materialId");

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            if (product.composition && product.composition.length > 0) {
                for (const comp of product.composition) {
                    const material = comp.materialId;
                    const requiredQty = comp.quantity * item.quantity;

                    if (!material || !material.status || material.stock < requiredQty) {
                        return res.status(400).json({
                            message: `Product "${product.name}" is unavailable (insufficient material: ${material ? material.name : 'unknown'})`
                        });
                    }
                }
            }
        }

        // 2. Reduce material stock
        for (const item of items) {
            const product = await Product.findById(item.productId).populate("composition.materialId");

            if (product.composition && product.composition.length > 0) {
                for (const comp of product.composition) {
                    const reduceQty = comp.quantity * item.quantity;
                    await Material.findByIdAndUpdate(comp.materialId._id, {
                        $inc: { stock: -reduceQty }
                    });
                }
            }
        }

        // 3. Create order details and calculate subtotal
        let subtotalAmount = 0;
        const orderDetailIds = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

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

        const order = await Order.findById(id).populate({
            path: "orderDetails",
            populate: { path: "productId" }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Restore material stock when cancelling an order
        if (status === 'cancelled' && order.status !== 'cancelled') {
            for (const detail of order.orderDetails) {
                const product = await Product.findById(detail.productId._id).populate("composition.materialId");

                if (product && product.composition && product.composition.length > 0) {
                    for (const comp of product.composition) {
                        const restoreQty = comp.quantity * detail.quantity;
                        await Material.findByIdAndUpdate(comp.materialId._id, {
                            $inc: { stock: restoreQty }
                        });
                    }
                }
            }
        }

        order.status = status;
        order.orderDate = new Date();
        await order.save();

        res.json(order);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /admin/order/get
 * Supports ?status=processing to fetch only ongoing orders (lightweight).
 * Without ?status, returns all orders (kept for backward compat but avoid calling without status).
 */
export const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const orders = await Order.find(filter)
            .sort({ orderDate: -1 })
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

/**
 * GET /admin/order/history
 * Server-side paginated history (completed + cancelled orders).
 * Query params: page, limit, startDate, endDate, type (all|member|guest), status (all|completed|cancelled)
 */
export const getOrderHistory = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const { startDate, endDate, type, status } = req.query;

        // Build filter — only history statuses
        const filter = { status: { $in: ['completed', 'cancelled'] } };

        // Override status filter if a specific status requested
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.orderDate = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filter.orderDate.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.orderDate.$lte = end;
            }
        }

        // Member/guest type filter applied at DB level using $exists
        if (type === 'member') {
            filter.userId = { $exists: true, $ne: null };
        } else if (type === 'guest') {
            filter.userId = { $exists: false };
            // Also handle null userId (guest orders created with userId: null/undefined)
            filter.$or = [{ userId: { $exists: false } }, { userId: null }];
            delete filter.userId;
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ orderDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate({ path: "userId", select: "username email" })
                .populate({
                    path: "orderDetails",
                    select: "quantity price",
                    populate: { path: "productId", select: "name" }
                }),
            Order.countDocuments(filter)
        ]);

        res.json({
            data: orders,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /admin/order/stats
 * Lightweight aggregation for the dashboard FrontPage.
 * Returns chart data, top products, and summary totals without sending individual order documents.
 * Query params: startDate, endDate
 */
export const getOrderStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d; })();
        start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const dateFilter = { orderDate: { $gte: start, $lte: end } };

        // Run aggregations in parallel
        const [summaryAgg, chartAgg, topProductsAgg, totalCountAgg] = await Promise.all([
            // 1. Summary stats (completed only)
            Order.aggregate([
                { $match: { ...dateFilter, status: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalIncome: { $sum: '$totalAmount' },
                        totalDiscount: { $sum: '$discountAmount' },
                        completedCount: { $sum: 1 }
                    }
                }
            ]),

            // 2. Daily sales chart (completed only)
            Order.aggregate([
                { $match: { ...dateFilter, status: 'completed' } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$orderDate' }
                        },
                        sales: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // 3. Top products by quantity (completed only) — lookup into OrderDetail + Product
            Order.aggregate([
                { $match: { ...dateFilter, status: 'completed' } },
                { $unwind: '$orderDetails' },
                {
                    $lookup: {
                        from: 'orderdetails',
                        localField: 'orderDetails',
                        foreignField: '_id',
                        as: 'detail'
                    }
                },
                { $unwind: '$detail' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'detail.productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $group: {
                        _id: '$product._id',
                        name: { $first: '$product.name' },
                        quantity: { $sum: '$detail.quantity' },
                        revenue: { $sum: { $multiply: ['$detail.quantity', '$detail.price'] } }
                    }
                },
                { $sort: { quantity: -1 } },
                { $limit: 15 }
            ]),

            // 4. Total order count (completed + cancelled) for the period
            Order.countDocuments({ ...dateFilter, status: { $in: ['completed', 'cancelled'] } })
        ]);

        const summary = summaryAgg[0] || { totalIncome: 0, totalDiscount: 0, completedCount: 0 };

        // Build a full date array from start to end so chart has every day
        const chartMap = {};
        chartAgg.forEach(d => { chartMap[d._id] = d.sales; });

        const salesData = [];
        const cursor = new Date(start);
        while (cursor <= end) {
            const key = cursor.toISOString().split('T')[0];
            const label = cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            salesData.push({ name: label, date: key, sales: chartMap[key] || 0 });
            cursor.setDate(cursor.getDate() + 1);
        }

        res.json({
            stats: {
                totalIncome: summary.totalIncome,
                totalDiscount: summary.totalDiscount,
                totalOrdersCount: totalCountAgg,
                completedCount: summary.completedCount
            },
            salesData,
            topProducts: topProductsAgg.map(p => ({
                name: p.name,
                quantity: p.quantity,
                revenue: p.revenue
            }))
        });

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

        // Legacy support: if page is not requested, return all orders as array, 404 if none
        if (req.query.page === undefined) {
            const orders = await Order.find({ userId })
                .sort({ orderDate: -1 })
                .populate({
                    path: "orderDetails",
                    populate: { path: "productId", select: "name" }
                });
            if (orders.length === 0) {
                return res.status(404).json({ message: "No orders found for this user" });
            }
            return res.json(orders);
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ userId })
                .sort({ orderDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "orderDetails",
                    populate: { path: "productId", select: "name" }
                }),
            Order.countDocuments({ userId })
        ]);

        res.json({ data: orders, total, page, totalPages: Math.ceil(total / limit), limit });

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