const { Schema } = require("mongoose");

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Bir xil nomli kategoriya bo'lmasligi uchun
    },
    image: {
      type: String, // Kategoriya rasmi (Base64 yoki URL)
      required: true,
    },
    icon: {
      type: String, // FontAwesome klassi uchun (masalan: 'fa-burger')
      default: "fa-solid fa-utensils",
    },
    order: {
      type: Number, // Kategoriyalarni menyuda chiqish tartibi
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
    },
    // Bu kategoriya ostida nechta taom borligini hisoblash uchun ixtiyoriy maydon
    // Yoki buni front-endda ham hisoblasa bo'ladi
    item_count: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true, // Yaratilgan va tahrirlangan vaqt
  }
);

module.exports = CategorySchema;