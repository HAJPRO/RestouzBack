const { Schema } = require("mongoose");

const CustomerSchema = new Schema({
  // Shaxsiy ma'lumotlar
  name: {
    type: String,
    required: [true, "Mijoz ismi kiritilishi shart"],
    trim: true
  },
  image: {
    type: String, // Base64 yoki URL
    default: "" 
  },
  phone: {
    type: String,
    required: [true, "Telefon raqami shart"],
    unique: true, // Bir xil raqamli mijozlar bo'lmasligi uchun
    trim: true
  },

  // Savdo va moliya
  balance: {
    type: Number,
    default: 0 // Musbat bo'lsa depozit, manfiy bo'lsa qarz
  },
  
  // Sodiqlik dasturi (Loyalty)
  category: {
    type: String,
    enum: ['new', 'regular', 'vip'],
    default: 'new'
  },
  
  // Yetkazib berish va aloqa
  address: {
    type: String,
    default: "",
    trim: true
  },
  
  // Analitika uchun (Avtomatik hisoblanishi mumkin)
  orderCount: {
    type: Number,
    default: 0
  },

  // Qo'shimcha maydonlar
  comment: {
    type: String, // Mijozning xohishlari yoki maxsus eslatmalar
    default: ""
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true // Ro'yxatdan o'tgan sanasini kuzatish uchun juda muhim
});

// Qidiruvni tezlashtirish uchun indexlar

module.exports = CustomerSchema;