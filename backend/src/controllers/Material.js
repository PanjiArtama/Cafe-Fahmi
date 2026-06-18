import Material from "../models/Material.js";

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

export const UpdateMaterial = async (req, res) => {
    try {
        const { id, name, stock, unit } = req.body;
        const updatedMaterial = await Material.findByIdAndUpdate(
            id,
            { name, stock, unit },
            { returnDocument: 'after', runValidators: true }
        );
        if (!updatedMaterial) {
            return res.status(404).json({ message: "Material not found" });
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
