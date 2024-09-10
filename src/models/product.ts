import mongoose from "mongoose";



const schema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, "Please Enter Name"]
    },
    photo: {
        type: String,
        required: [true, "Please Add Photo"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter Price"]
    },
    stock: {
        type: Number,
        required: [true, "Please Enter Stock"]
    },
    category: {
        type: String,
        required: [true, "Please Enter Category"],
        trim: true,
    },
    

}, { timestamps:true})

export interface ProductDocument extends Document {
    name: string;
    photo: string;
    price: number;
    stock: number;
    category: string;
    createdAt: Date; // These fields are automatically added by Mongoose
    updatedAt: Date; // Because of the { timestamps: true } option in the schema
  }
  
export const Product = mongoose.model("Product", schema);