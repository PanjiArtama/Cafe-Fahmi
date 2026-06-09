import Category from "../models/Category.js";
import Product from "../models/Product.js";
const isValidObjectId = (id) => {
    const regex = /^[0-9a-fA-F]{24}$/;
    return regex.test(id);
};
export const GetProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: true })
            .populate("category")
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const AddProduct = async (req, res) => {
    try {
        const imagePath = req.file
            ? `/uploads/menu/${req.file.filename}`
            : null;

        let { name, price, desc, category, composition } = req.body;

        if (typeof composition === 'string') {
            try {
                composition = JSON.parse(composition);
            } catch (e) {
                return res.status(400).json({ message: "Invalid composition format" });
            }
        }

        if (!isValidObjectId(category)) {
            const newCat = await Category.create({ name: category });
            category = newCat._id;
        }
        const newProduct = await Product.create({
            name,
            price,
            desc,
            category,
            composition,
            image: imagePath
        });

        res.status(201).json(newProduct);
    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({ message: "Product name already exists" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
export const UpdateProduct = async (req, res) => {
    try {
        let { id, name, price, desc, category, composition: rawComposition } = req.body;
        let composition = rawComposition;
        if (typeof rawComposition === 'string') {
            try {
                composition = JSON.parse(rawComposition);
            } catch (e) {
                return res.status(400).json({ message: "Invalid composition format" });
            }
        }
        if (!isValidObjectId(category)) {
            const newCat = await Category.create({ name: category });
            category = newCat._id;
        }
        const updateData = {
            name,
            price,
            desc,
            category,
            composition
        };
        if (req.file) {
            updateData.image = `/uploads/menu/${req.file.filename}`;
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
export const DeleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedProduct = await Product.findByIdAndUpdate(id, { status: false });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}