import OrderDetail from "../models/OrderDetail.js";
import Order from "../models/Order.js";
import UserCoupon from "../models/UserCoupon.js";

const SeedOrder = async (users, products, coupons) => {
    const productMap = {
        martabak: products[0],
        tiramisu: products[1],
        americano: products[2],
        espresso: products[3],
    };

    const userMap = {
        user1: users[0],
        user2: users[1],
    };

    const couponMap = {
        disc10: coupons.find(c => c.code === "DISC10"),
        disc20: coupons.find(c => c.code === "DISC20"),
        fixed5k: coupons.find(c => c.code === "FIXED5K"),
    };

    // 🔥 1. Create Order Details
    const OD = await OrderDetail.insertMany([
        { productId: productMap.martabak._id, quantity: 2, price: productMap.martabak.price },
        { productId: productMap.tiramisu._id, quantity: 1, price: productMap.tiramisu.price },
        { productId: productMap.americano._id, quantity: 3, price: productMap.americano.price },
        { productId: productMap.espresso._id, quantity: 2, price: productMap.espresso.price },
    ]);

    const calcSubtotal = (items) =>
        items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const ordersData = [];

    // ✅ Order 1 (User1 uses DISC10 → UNUSED → will be marked USED)
    const subtotal1 = calcSubtotal([OD[0], OD[1]]);
    let discount1 = (subtotal1 * 10) / 100;
    discount1 = Math.min(discount1, 20000);

    ordersData.push({
        userId: userMap.user1._id,
        subtotalAmount: subtotal1,
        discountAmount: discount1,
        totalAmount: subtotal1 - discount1,
        couponId: couponMap.disc10._id,
        orderDetails: [OD[0]._id, OD[1]._id],
        status: "completed"
    });

    // 🔥 mark DISC10 as used for user1
    await UserCoupon.updateOne(
        { userId: userMap.user1._id, couponId: couponMap.disc10._id },
        { isUsed: true, usedAt: new Date() }
    );

    // ❌ Order 2 (Guest, no coupon)
    const subtotal2 = calcSubtotal([OD[2]]);
    ordersData.push({
        userId: null,
        guestName: "Guest User",
        subtotalAmount: subtotal2,
        discountAmount: 0,
        totalAmount: subtotal2,
        couponId: null,
        orderDetails: [OD[2]._id],
        status: "processing"
    });

    // ❌ Order 3 (User1 already USED DISC20 → should NOT apply discount)
    const subtotal3 = calcSubtotal([OD[3]]);
    ordersData.push({
        userId: userMap.user1._id,
        subtotalAmount: subtotal3,
        discountAmount: 0,
        totalAmount: subtotal3,
        couponId: null, // not applied because already used
        orderDetails: [OD[3]._id],
        status: "completed"
    });

    // ✅ Order 4 (User2 uses FIXED5K → UNUSED → becomes USED)
    const subtotal4 = calcSubtotal([OD[1]]);
    const discount4 = 5000;

    ordersData.push({
        userId: userMap.user2._id,
        subtotalAmount: subtotal4,
        discountAmount: discount4,
        totalAmount: subtotal4 - discount4,
        couponId: couponMap.fixed5k._id,
        orderDetails: [OD[1]._id],
        status: "completed"
    });

    await UserCoupon.updateOne(
        { userId: userMap.user2._id, couponId: couponMap.fixed5k._id },
        { isUsed: true, usedAt: new Date() }
    );

    // 🔥 2. Insert Orders
    const orders = await Order.insertMany(ordersData);

    console.log(`${orders.length} Orders seeded successfully!`);
    return orders;
};

export default SeedOrder;