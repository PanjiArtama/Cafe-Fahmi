import express from "express";
import { AddCategory, DeleteCategory, UpdateCategory } from "../../controllers/Category.js";
import { isAdmin } from "../../middleware/auth.js";

const AdminCat = express.Router();

AdminCat.post("/add", isAdmin , AddCategory);
AdminCat.post("/delete", isAdmin, DeleteCategory);
AdminCat.post("/update", isAdmin, UpdateCategory);

export default AdminCat