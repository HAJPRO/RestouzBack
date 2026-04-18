const mongoose = require("mongoose");

const { Schema } = mongoose;

const CartSchema = new Schema({
  // Buyurtma turi: 'table' (stolga) yoki 'takeaway' (olib ketish)
  orderType: {
    type: String,
    enum: ['table', 'takeaway'],
    required: true,
    default: 'table'
  },

  // Buyurtma tarkibidagi mahsulotlar
  items: [{
    foodId: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true } // foodId.price * quantity
  }],

  // --- Moliyaviy hisob-kitoblar ---
  subtotal: { 
    type: Number, 
    required: true,
    default: 0 
  },
  
  // Xizmat haqi foizi (odatda 10%) va summasi
  isServiceActive : {
    type : Boolean,
    default : true
  },
  serviceFeePercent: { 
    type: Number, 
    default: 10 
  },
  serviceFeeAmount: { 
    type: Number, 
    default: 0 
  },

  // Chegirma foizi va hisoblangan summasi
  discountPercent: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: { 
    type: Number, 
    default: 0 
  },

  // Yakuniy to'lov ( (Subtotal + Service) - Discount )
  finalTotal: { 
    type: Number, 
    required: true,
    index: true // Hisobotlar uchun qidiruvni tezlashtiradi
  },

  // --- Bog'liqliklar ---
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table',
    default: null
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee', // Yoki 'Staff'
    default: null
    
    
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
    
  },

  // Buyurtma holati
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },

  // To'lov turi
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'unpaid'],
    default: 'unpaid'
  },

  comment: {
    type: String,
    trim: true,
    default: ""
  },
  edit:{
    type:Boolean,
    default:false
  }
}, { 
  timestamps: true,
  versionKey: false // __v maydonini o'chirib qo'yadi (toza json uchun)
});


module.exports = CartSchema;