const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  // Qaysi mijozga tegishli ekanligi
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true, 
    index: true 
  },

  // Agar tranzaksiya buyurtma yopilayotgan paytda yuz bergan bo'lsa (debt yoki surplus)
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Cart', 
    default: null 
  },

  // Tranzaksiya turi
  type: { 
    type: String, 
    enum: ['payment', 'debt', 'surplus', 'refund'], 
    required: true,
    index: true
    /**
     * payment: Qarzni yopish (Mijoz pul olib keldi) -> Balans (+)
     * debt: Qarzga ovqatlanish (Nasiya shakllandi) -> Balans (-)
     * surplus: Qaytimni balansda qoldirish -> Balans (+)
     * refund: Balansdagi pulni mijozga qaytarib berish -> Balans (-)
     */
  },

  // Pul miqdori (Har doim musbat sonda saqlanadi, mantiq 'type' orqali boshqariladi)
  amount: { 
    type: Number, 
    required: true, 
    min: [0, "Summa manfiy bo'lishi mumkin emas"] 
  },

  // To'lov usuli
  method: { 
    type: String, 
    enum: ['cash', 'card', 'terminal', 'balance'], 
    required: true 
  },

  // Operatsiyani bajargan xodim (Admin yoki Kassir)
  staffId: { 
   type:Number,
    default:0
  },

  // Qo'shimcha izoh (masalan: "Falonchi kungi qarz uchun to'lov")
  description: { 
    type: String, 
    trim: true, 
    default: "" 
  }
}, { 
  timestamps: true, // Qachon amal bajarilganini aniq bilish uchun
  versionKey: false 
});

// Hisobotlar uchun indekslar (Sana bo'yicha filtrlashni tezlashtiradi)
TransactionSchema.index({ createdAt: -1 });

module.exports = TransactionSchema;