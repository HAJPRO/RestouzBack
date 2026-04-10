const { Schema } = require("mongoose");

const MenuSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // Rasm yo'li (URL yoki path)
      required: true,
    },
    price: {
      type: Number, // Narxlar bilan ishlashda Number yaxshiroq
      required: true,
      default: 0,
    },
    discount_price: {
      type: Number, // Chegirma narxi
      default: 0,
    },
    category: {
      type: String, // Masalan: 'soups', 'drinks', 'main_dishes'
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "out_of_stock", "hidden"],
      default: "active",
      // Izohlar:
      // "active"       -> Sotuvda mavjud
      // "out_of_stock" -> Vaqtincha tugagan
      // "hidden"       -> Menyuda ko'rinmaydi
    },
    description: {
      type: String, // Taom tarkibi va tavsifi
      required: true,
    },
    is_popular: {
      type: Boolean, // "Mashhur taom" belgisi
      default: false,
    },
    cooking_time: {
      type: String, // Tayyorlanish vaqti (Masalan: "15-20 min")
      default: "15",
    },
    // Agar ingredientlarni alohida saqlamoqchi bo'lsangiz
    ingredients: [{
      type: String
    }],
    // O'lchov birligi
    unit: {
      type: String,
      default: "1 porsiya", // Masalan: "100gr", "1 dona"
    }
  }, 
  {
    timestamps: true, // Yaratilgan va yangilangan vaqtni saqlaydi
  }
);


module.exports = MenuSchema;