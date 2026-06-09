import express from "express";
import { GetAllCategories, GetCategories } from "../../controllers/Category.js";

const PublicCat = express.Router();

PublicCat.get("/", GetCategories);
PublicCat.get("/all", GetAllCategories);

export default PublicCat