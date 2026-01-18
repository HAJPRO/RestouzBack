const mongoose = require('mongoose');

const AccessoriesInboundSchema = new mongoose.Schema({
  code : {type:String,  unique: true, // Har bir partiya unikal bo'lishi shart
      required: true},
  // 1. Logistika va Joylashuv
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counterparty',
    // required: [true, "Qabul qiluvchi zavod ko'rsatilishi shart"]
  },
  counterparty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counterparty',
    required: [true, "Yetkazib beruvchi (fermer) ko'rsatilishi shart"]
  },

  // 2. Mahsulotlar ro'yxati (Savatcha)
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String, // Tarixiy ma'lumot uchun nomini saqlab qolish yaxshi
    qty: {
      type: Number,
      required: true,
      min: [0.01, "Miqdor noldan katta bo'lishi kerak"]
    },
    costPrice: {
      type: Number,
      required: true
    },
    unit: String,
    volumeUnit : {type:String},
    volume : {type : String},
  }],
  // 3. Moliyaviy yakun
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },

  // 4. Ma'lumot va Status
  status: {
    type: String,
    enum: ['Accepted', 'Completed', 'Cancelled'],
    default: 'Completed'
  },
  description: String,
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Qabul qilgan xodim
  }
}, { 
  timestamps: true // created_at va updated_at avtomatik qo'shiladi
});



module.exports = mongoose.model('AccessoriesInbound', AccessoriesInboundSchema);