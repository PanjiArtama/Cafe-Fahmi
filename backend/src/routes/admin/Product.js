import express from "express";
import { isAdmin } from "../../middleware/auth.js";
import { uploadMenuImage } from "../../middleware/uploadImage.js";
import { AddProduct, DeleteProduct, UpdateProduct } from "../../controllers/Product.js";

const AdminProduct = express.Router();

AdminProduct.post("/add" , isAdmin , uploadMenuImage.single("image") , AddProduct);
AdminProduct.put("/update" , isAdmin , uploadMenuImage.single("image") , UpdateProduct);
AdminProduct.delete("/delete" , isAdmin , DeleteProduct);

export default AdminProduct