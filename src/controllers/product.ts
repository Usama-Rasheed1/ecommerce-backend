import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewProductRequestBody } from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utilityClass.js";
import { rm } from "fs";
import { log } from "console";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please Add Photo", 400));
    if (!name || !price || !stock || !category) {
        rm(photo.path, ()=>{
            console.log("Missing Input Field: deleting added photo");
            
        })
      return next(new ErrorHandler("Please Enter All Fields", 400));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    return res.status(201).json({
      success: true,
      message: "Product Created!",
    });
  }
);


export const getLatestProducts = TryCatch(
    async (req, res, next) => {
      
        const products = await Product.find({}).sort({createsAt: -1}).limit(5);
      return res.status(200).json({
        success: true,
        products,
      });
    }
  );

  export const getAllCategories = TryCatch(
    async (req, res, next) => {
      
        const categories = await Product.distinct("category");
      return res.status(200).json({
        success: true,
        categories,
      });
    }
  );

  export const getAdminProducts = TryCatch(
    async (req, res, next) => {
      
        const products = await Product.find({});
      return res.status(200).json({
        success: true,
        products,
      });
    }
  );

  export const getSingleProduct = TryCatch(
    async (req, res, next) => {
      
        const products = await Product.findById(req.params.id);
      return res.status(200).json({
        success: true,
        products,
      });
    }
  );