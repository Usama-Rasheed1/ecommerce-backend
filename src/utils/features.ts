import { console } from "inspector";
import mongoose from "mongoose";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import { invalidateCacheProps, OrderItemType } from "../types/types.js";

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
  userId,
  orderId,
  productId,
}: invalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latestProducts",
      "categories",
      "allProducts",
    ];
    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${i}`));
    
    myCache.del(productKeys);
  }
  if (order) {
    const orderKeys: string[] = [
      "allOrders",
      `myOrders-${userId}`,
      `order-${orderId}`,
    ];

    myCache.del(orderKeys);
  }
  if (admin) {
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let index = 0; index < orderItems.length; index++) {
    const order = orderItems[index];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;

    await product.save();
  }
};
