const mongoose = require('mongoose');

// 1. Elementlar uchun sxema (Har bir matn, QR kod yoki shtrix-kod uchun)
const elementSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Vue'dagi vaqtinchalik ID
  type: { 
    type: String, 
    enum: ['name', 'price', 'qr', 'quantity', 'barcode','fullname'], 
    required: true 
  },
  value: { type: String, default: '' },
  x: { type: Number, required: true }, // mm hisobida
  y: { type: Number, required: true }, // mm hisobida
  w: { type: Number, required: true }, // mm hisobida
  h: { type: Number, required: true }, // mm hisobida
  fontSize: { type: Number, default: null }
});

// 2. Shablon uchun asosiy sxema
const templateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Shablon nomi kiritilishi shart'],
    trim: true 
  },
  width: { 
    type: Number, 
    required: true, 
    default: 40 // mm 
  },
  height: { 
    type: Number, 
    required: true, 
    default: 30 // mm 
  },
  // Elementlar massivi (Embedded Document)
  elements: [elementSchema],
  
  // Qo'shimcha ma'lumotlar
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Agar foydalanuvchilarga bo'lmoqchi bo'lsangiz
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Otomatik ravishda createdAt va updatedAt vaqtini boshqaradi
});

// Modelni eksport qilish
const PricePrinterTemplate = mongoose.model('PricePrinterTemplate', templateSchema);

module.exports = PricePrinterTemplate;