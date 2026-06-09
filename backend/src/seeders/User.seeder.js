import User from "../models/User.js"
import bcrypt from 'bcrypt';

const SeedUser = async () => {
    const res = await User.insertMany([
        {
            username: "user1",
            email: "user1@mail.com",
            phone : "08123456789",
            password: await bcrypt.hash("user1password", 12)
        },
        {
            username: "user2",
            email: "user2@mail.com",
            phone : "09812345678",
            password: await bcrypt.hash("user2password", 12)
        },
    ])
    const admin = await User.insertMany([
        {
            username: "admin",
            email: "admin@example.com",
            role : "admin",
            password: await bcrypt.hash("admin123", 12),
            phone : "08123456789"
        }
    ])
    console.log("Users seeded");
    return [res, admin];
}

export default SeedUser;