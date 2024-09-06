import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { getAdminProducts, getAllCategories, getLatestProducts, getSingleProduct, newProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();

// Route - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct);
// Route - /api/v1/product/latest
app.get("/latest", getLatestProducts);
// Route - /api/v1/product/categories
app.get("/categories", getAllCategories);
// Route - /api/v1/product/admin-products
app.get("/admin-products", getAdminProducts);

//
app.route("/:id").get(getSingleProduct);

export default app;
