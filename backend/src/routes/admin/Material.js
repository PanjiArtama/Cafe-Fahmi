import express from "express";
import { isAdmin } from "../../middleware/auth.js";
import { GetMaterials, AddMaterial, GetHistoryMaterial, UpdateMaterial, DeleteMaterial } from "../../controllers/Material.js";

const AdminMaterial = express.Router();

AdminMaterial.get("/", isAdmin, GetMaterials);
AdminMaterial.post("/add", isAdmin, AddMaterial);
AdminMaterial.put("/update", isAdmin, UpdateMaterial);
AdminMaterial.delete("/delete", isAdmin, DeleteMaterial);
AdminMaterial.get("/history", isAdmin, GetHistoryMaterial);

export default AdminMaterial;
