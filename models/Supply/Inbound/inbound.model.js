const mongoose = require('mongoose');

const SupplyInboundSchema = new mongoose.Schema({
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
    
    
    fat: {
      type: Number, // Yog'lilik foizi
      default: 0
    },
    temp: {
      type: Number, // Harorat (°C)
      default: 0
    },
    density: {
      type: Number, // Zichlik
      default: 1.028
    },
    acidity: {
      type: Number, // Kislotalilik (°T - Terner darajasi)
      default: 18
    },
    labStatus: {
      type: String,
      enum: ['Accepted', 'Rejected', 'Conditional'],
      default: 'Accepted'
    }
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
    enum: ['Draft', 'Completed', 'Cancelled'],
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

// Saqlashdan oldin umumiy summani tekshirish mantiqi
SupplyInboundSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.qty * item.costPrice), 0);
  next();
});

module.exports = mongoose.model('SupplyInbound', SupplyInboundSchema);