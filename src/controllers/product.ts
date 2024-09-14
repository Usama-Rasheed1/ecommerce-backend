import { NextFunction, Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product, ProductDocument } from "../models/product.js";
import ErrorHandler from "../utils/utilityClass.js";
import { rm } from "fs";
import { log } from "console";
import { FilterQuery } from "mongoose";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";



// reValidate on new, update, delete and new-order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latestProducts"))
    products = JSON.parse(myCache.get("latestProducts") as string);
  else {
    products = await Product.find({}).sort({ createsAt: -1 }).limit(5);
    myCache.set("latestProducts", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// reValidate on new, update, delete and new-order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({
    success: true,
    categories,
  });
});

// reValidate on new, update, delete and new-order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("allProducts"))
    products = JSON.parse(myCache.get("allProducts") as string);
  else {
    products = await Product.find({});
    myCache.set("allProducts", JSON.stringify(products));
  }
  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(id);
    if (!product)
      return next(new ErrorHandler("Not Found: Invalid Product Id", 404));

    myCache.set(`product-${id}`, JSON.stringify(product));
  }
  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please Add Photo", 400));
    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Missing Input Field: deleting added photo");
      });
      return next(new ErrorHandler("Please Enter All Fields", 400));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created!",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product)
    return next(new ErrorHandler("Not Found: Invalid Product Id", 404));

  if (photo) {
    rm(product.photo, () => {
      console.log("Old Photo Deleted!");
    });
    product.photo = photo.path;
  }
  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();
  invalidateCache({ product: true, productId: String(product._id), admin: true });

  return res.status(200).json({
    success: true,
    message: "Product Updated!",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return next(new ErrorHandler("Not Found: Invalid Product Id", 404));

  rm(product.photo, () => {
    console.log("Product Photo Deleted!");
  });
  await product.deleteOne();
  invalidateCache({ product: true, productId: String(product._id), admin: true });

  return res.status(200).json({
    success: true,
    message: "Product Deleted!",
  });
});

export const getAllProduct = TryCatch(
  async (
    req: Request<{}, {}, {}, SearchRequestQuery>,
    res,
    next: NextFunction
  ) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    // Create the base query, typed as FilterQuery<ProductDocument> using your BaseQuery interface
    const baseQuery: FilterQuery<ProductDocument> & BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    // Fetch products based on query and pagination
    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    // Fetch the total count of products matching the base query
    const countPromise = Product.countDocuments(baseQuery);

    // Resolve both promises simultaneously
    const [products, totalProducts] = await Promise.all([
      productsPromise,
      countPromise,
    ]);

    const totalPage = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
