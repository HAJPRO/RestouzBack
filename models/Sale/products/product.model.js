// models/Product.js
const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const ProductSchema = new Schema(
  {
    // --- 1. Asosiy Ma'lumotlar ---
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    code: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
      index: true
    },
    category: {
      type: String, 
      required: true,
      trim: true,
      index: true
    },
    image: {
      type: String, // Fayl yo'li (path) string ko'rinishida saqlanadi
      default: ""
    },
    description: {
      type: String,
      trim: true
    },
qr:{type:String},
    // --- 2. O'lchov va Qadoq ---
    unit: {
      type: String,
      default: "dona", 
      enum: ["dona", "kg", "litr", "metr", "qop", "blok"]
    },
    
    packSize: { 
      type: Number, 
      default: 1 
    }, 

    // --- 3. Narx Siyosati ---
    costPrice: { 
      type: Number, 
      default: 0,
      min: 0
    },
    salePrice: { 
      type: Number, 
      required: true, 
      min: 0
    },
    // USTAMA FOIZI: Max 100 cheklovi olib tashlandi, chunki ustama 100% dan oshishi mumkin
    margainPercent: {
      type: Number,
      default: 0,
      min: 0,
      // max: 100 olib tashlandi
    },
    
    // --- 4. Zaxira ---
    totalStock: {
      type: Number,
      default: 0,
      index: true 
    },
    minStockAlert: {
      type: Number,
      default: 10
    },

    // --- 5. Tizim Ma'lumotlari ---
    author: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    status: {
      type: String,
      enum: ["active", "inactive"], 
      default: "active",
      index: true
    },
    state : {type: Boolean, default: true}
  },
  {
    timestamps: true, // createdAt va updatedAt avtomatik boshqariladi
  }
);

module.exports = ProductSchema;