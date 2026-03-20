const mongoose = require("mongoose");

const ReadyWarehouseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // IDlar string bo'lsa, xatolik chiqmasligi uchun default beramiz yoki requiredni olib tashlaymiz
  branchId: {type: String, },
  supplierId: { type: String, },
  
  inputId: { type: mongoose.Schema.Types.ObjectId, ref: 'InboundHistory' },
  partyNumber: { type: String, required: true }, 
  
  initialQuantity: { type: Number, required: true, min: 0 },
  currentQuantity: { type: Number, required: true, min: 0 },
  
  costPrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  author : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['active', 'sold_out'], 
    default: 'active'
  }
}, { timestamps: true });
module.exports = ReadyWarehouseSchema;