import express from "express";
import { GetProducts } from "../../controllers/Product.js";

const PublicProduct = express.Router();

PublicProduct.get("/" , GetProducts);

export default PublicProduct