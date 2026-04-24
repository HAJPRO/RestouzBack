const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartSchema = new Schema({
  // ... (items, subtotal, serviceFee va boshqa maydonlar o'zgarishsiz qoladi)
  orderType: { type: String, enum: ['table', 'takeaway'], required: true, default: 'table' },
  items: [{
    foodId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true }
  }],

  subtotal: { type: Number, required: true, default: 0 },
  isServiceActive: { type: Boolean, default: true },
  serviceFeePercent: { type: Number, default: 10 },
  serviceFeeAmount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, default: 0 },
  
  finalTotal: { type: Number, required: true, index: true },

  // --- Yangilangan To'lov Qismi ---
  paymentMethod: {
    type: String,
    // 'balance' qo'shildi - bu mijoz o'z depozitidan to'laganini bildiradi
    enum: ['cash', 'card', 'debt', 'balance', 'mixed', 'unpaid'], 
    default: 'unpaid',
    index: true
  },

  payments: [{
    type: { 
      type: String, 
      // 'balance' qo'shildi - massiv ichida qaysi qismi depozitdan yechilganini bilish uchun
      enum: ['cash', 'card', 'debt', 'balance'], 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true, 
      default: 0 
    },
    paidAt: { 
      type: Date, 
      default: Date.now 
    }
  }],

  surplusAmount: {
    type: Number,
    default : 0
  }, // Ortiqcha summa (Mijozning depozitiga ketgan pul)

  isDebtClosed: {
    type: Boolean,
    default: false
  },

  // --- Bog'liqliklar ---
  tableId: { type: Schema.Types.ObjectId, ref: 'Tabel', default: null },
  staffId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer', 
    default: null,
  },

  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  comment: { type: String, trim: true, default: "" },
  edit: { type: Boolean, default: false }
}, { 
  timestamps: true,
  versionKey: false 
});

// Middleware: Agar qarz bo'lsa mijoz bo'lishi shartligini tekshirish (ixtiyoriy lekin tavsiya etiladi)
CartSchema.pre('save', function(next) {
  const hasDebt = this.payments.some(p => p.type === 'debt');
  const hasBalance = this.payments.some(p => p.type === 'balance');
  
  if ((hasDebt || hasBalance) && !this.customerId) {
    return next(new Error("Qarz yoki Balans orqali to'lov uchun mijozni tanlash majburiy!"));
  }
  next();
});

module.exports = CartSchema;