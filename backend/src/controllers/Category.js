import Category from "../models/Category.js";

export const AddCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const newCat = await Category.create({ name });
        res.status(201).json(newCat);
    } catch (error) {
        res.status(500).json({ message: "Server error", error : error.message });
    }
}

export const DeleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        const category = await Category.findByIdAndUpdate(id, { status: false });
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error : error.message });
    }
}

export const UpdateCategory = async (req, res) => {
    try {
        const { id, name } = req.body;
        const category = await Category.findByIdAndUpdate(id, { name });
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category updated" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error : error.message });
    }
}

import Product from "../models/Product.js";

export const GetCategories = async (req, res) => {
    try {
        const categories = await Category.find({ status: true });
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await Product.countDocuments({ 
                    category: cat._id,
                    status: true // Only count active products
                });
                
                return {
                    ...cat.toObject(),
                    productCount: count
                };
            })
        );

        res.json(categoriesWithCount);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const GetAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Server error", error : error.message });
    }
}