import Material from "../models/Material.js";
import MaterialHistory from '../models/MaterialHistory.js'; 

export const GetMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ status: true });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const AddMaterial = async (req, res) => {
    try {
        const { name, stock, unit } = req.body;
        const newMaterial = await Material.create({ name, stock, unit });
        res.status(201).json(newMaterial);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Material name already exists" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const GetHistoryMaterial = async (req, res) => {
    try {
        const mats = await MaterialHistory.find()
            .populate('materialId', 'name')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json(mats);
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e.message });
    }
}

export const UpdateMaterial = async (req, res) => {
    try {
        
        const { id, name, stock, unit, notes } = req.body;

        
        const existingMaterial = await Material.findById(id);

        if (!existingMaterial) {
            return res.status(404).json({ message: "Material not found" });
        }

        const previousStock = existingMaterial.stock;

        
        existingMaterial.name = name !== undefined ? name : existingMaterial.name;
        existingMaterial.stock = stock !== undefined ? stock : existingMaterial.stock;
        existingMaterial.unit = unit !== undefined ? unit : existingMaterial.unit;

        const updatedMaterial = await existingMaterial.save();

        
        
        if (stock !== undefined && previousStock !== stock) {
            const stockDifference = stock - previousStock;

            
            let transactionType = 'ADJUSTMENT';
            if (stockDifference > 0) {
                transactionType = 'IN';
            } else if (stockDifference < 0) {
                transactionType = 'OUT';
            }

            
            await MaterialHistory.create({
                materialId: id,
                transactionType: transactionType,
                quantity: Math.abs(stockDifference), 
                previousStock: previousStock,
                currentStock: stock,
                notes: notes || "Update manual dari dashboard"
            });
        }

        res.status(200).json(updatedMaterial);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const DeleteMaterial = async (req, res) => {
    try {
        const { id } = req.body;
        await Material.findByIdAndUpdate(id, { status: false });
        res.status(200).json({ message: "Material deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
