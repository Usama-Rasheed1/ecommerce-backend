import e from "express";
import { console } from "inspector";
import mongoose from "mongoose";
import { invalidateCacheProps } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "Ecommerce",
    })
    .then((c) => console.log(`Connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};
export const invalidateCache = async ({
  product,
  order,
  admin,
}: invalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = ["latestProducts", "categories", "allProducts",];

    const products = await Product.find({}).select("_id");
    products.forEach(element => {
      productKeys.push(`product-${element._id}`);
      
    });
    myCache.del(productKeys);
  }
  if (order) {
  }
  if (admin) {
  }
};
