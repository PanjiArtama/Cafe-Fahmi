import { connectDB, resetDB } from "./utils/db.js";
import SeedCategory from "./seeders/Category.seeder.js";
import SeedProduct from "./seeders/Product.seeder.js";
import SeedUser from "./seeders/User.seeder.js";
import SeedOrder from "./seeders/Order.seeder.js";
import SeedCoupon from "./seeders/Coupon.seeder.js";
import SeedUserCoupon from "./seeders/UserCoupon.seeder.js";
import SeedWebInformation from "./seeders/WebInformation.seeder.js";

const run = async () => {
    try {
        await connectDB();

        await resetDB();
        const cat = await SeedCategory();
        const prod = await SeedProduct(cat);
        const [users, admin] = await SeedUser();
        const coupons = await SeedCoupon();
        await SeedUserCoupon(users, coupons);
        await SeedOrder(users, prod, coupons);
        await SeedWebInformation();
        console.log('Seeding complete');
        process.exit();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();