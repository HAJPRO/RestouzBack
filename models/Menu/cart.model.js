const mongoose = require("mongoose");

const { Schema } = mongoose;

const CartSchema = new Schema({
  // Buyurtma turi: 'table' (stolga) yoki 'takeaway' (olib ketish)
  orderType: {
    type: String,
    enum: ['table', 'takeaway'],
    required: true, // Professional darajada bu true bo'lgani yaxshi
    default: 'table'
  },

  // Buyurtma tarkibidagi mahsulotlar
  items: [{
    foodId: {
      type: Schema.Types.ObjectId,
      ref: 'Menu', // Menu modeli bilan bog'liqlik
      required: true // Mahsulotsiz buyurtma bo'lishi mumkin emas
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true }
  }],

  // Moliyaviy hisob-kitoblar
  subtotal: { 
    type: Number, 
    required: true,
    default: 0 
  },
  serviceFee: { 
    type: Number, 
    default: 0 
  },
  discountAmount: { 
    type: Number, 
    default: 0 
  },
  finalTotal: { 
    type: Number, 
    required: true 
  },

  // Bog'liqliklar (Relationships)
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table', // Stol modeli bilan bog'liqlik
    default: null
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Xodim (ofitsiant) modeli bilan bog'liqlik
    default: null
  },

  // Buyurtma holati
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Qo'shimcha izoh
  comment: {
    type: String,
    trim: true,
    default: ""
  }
}, { 
  timestamps: true 
});


module.exports = CartSchema;