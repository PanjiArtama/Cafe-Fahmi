import User from '../models/User.js';
import Order from '../models/Order.js';
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// export const getAllUsersStats = async (req, res) => {
//     const threeMonthsAgo = new Date();
//     threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
//     threeMonthsAgo.setDate(1);

//     try {
//         const report = await Order.aggregate([
//             {
//                 // Stage 1: Group by User AND Month to get monthly buckets
//                 $group: {
//                     _id: {
//                         userId: "$userId",
//                         year: { $year: "$orderDate" },
//                         month: { $month: "$orderDate" }
//                     },
//                     monthlySpend: { $sum: "$totalAmount" },
//                     monthlyOrders: { $sum: 1 },
//                     // We keep the userId separate to regroup in the next stage
//                     rawUserId: { $first: "$userId" }
//                 }
//             },
//             {
//                 // Stage 2: Group by User only to get Lifetime stats and the Array
//                 $group: {
//                     _id: "$rawUserId",
//                     lifetimeSpend: { $sum: "$monthlySpend" },
//                     totalOrders: { $sum: "$monthlyOrders" },
//                     monthlyBreakdown: {
//                         $push: {
//                             $cond: [
//                                 {
//                                     $gte: [
//                                         { $dateFromParts: { year: "$_id.year", month: "$_id.month" } },
//                                         threeMonthsAgo
//                                     ]
//                                 },
//                                 {
//                                     month: "$_id.month",
//                                     year: "$_id.year",
//                                     spend: "$monthlySpend",
//                                     orders: "$monthlyOrders"
//                                 },
//                                 "$$REMOVE" // Don't push old months into the 3-month array
//                             ]
//                         }
//                     }
//                 }
//             },
//             {
//                 // Stage 3: Join with User Collection
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "user"
//                 }
//             },
//             { $unwind: "$user" },
//             {
//                 // Stage 4: Final Selection
//                 $project: {
//                     _id: 0,
//                     userId: "$_id",
//                     username: "$user.username",
//                     email: "$user.email",
//                     lifetimeSpend: 1,
//                     totalOrders: 1,
//                     monthlyBreakdown: 1
//                 }
//             }
//         ]);

//         res.json(report);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
export const getAllUsersStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        // Construct the filter for the orders (not the users)
        const orderFilter = { status: 'completed' };

        if (startDate || endDate) {
            orderFilter.createdAt = {};
            if (startDate) orderFilter.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                orderFilter.createdAt.$lte = end;
            }
        }

        const report = await User.aggregate([
            {
                // 1. Filter for 'user' role ONLY before doing any heavy lifting
                $match: { role: 'user' }
            },
            {
                // 1. Join with Orders
                $lookup: {
                    from: "orders", // ensure this matches your actual collection name
                    localField: "_id",
                    foreignField: "userId",
                    pipeline: [
                        // 2. Filter orders inside the lookup to handle date ranges correctly
                        { $match: orderFilter }
                    ],
                    as: "userOrders"
                }
            },
            {
                // 3. Project and calculate stats
                $project: {
                    _id: 0,
                    userId: "$_id",
                    username: 1,
                    email: 1,
                    // If the array is empty, $sum returns 0 automatically
                    lifetimeSpend: { $sum: "$userOrders.totalAmount" },
                    totalOrders: { $size: "$userOrders" }
                }
            }
        ]);

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, email, phone } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { username, email, phone },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}