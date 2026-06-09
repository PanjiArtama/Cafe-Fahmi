import Category from "../models/Category.js";

const SeedCategory = async () => {
    const res = await Category.insertMany([
        { name : "Dessert", status : true},
        { name : "Coffee", status : true},
        { name : "Non-Coffee", status : true},
    ])
    console.log("Categories seeded");
    return res;
}

export default SeedCategory;