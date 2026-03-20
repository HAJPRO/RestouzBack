const mongoose = require('mongoose');

const InboundHistorySchema = new mongoose.Schema({
  // "FKT-2025-12-17" kabi raqam
  partyNumber: { 
    type: String, 
    required: true, 
    // unique: true,
    // index: true 
  },
  supplierId: { 
    type: String, // Agar MongoDB ID bo'lsa: mongoose.Schema.Types.ObjectId
    required: true 
  },
  branchId: { 
    type: String, 
    required: true 
  },
  // Savatchadagi barcha mahsulotlar (History uchun)
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    unit: { type: String, default: 'dona' }
  }],
  totalAmount: { type: Number, required: true }, // Fakturaning jami summasi
  note: { type: String, default: "" },
  action: { type: Number, default: 1 }, // 1: Create
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = InboundHistorySchema;