const mongoose = require('mongoose');

const AccessoriesSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    image: { type: String, default: null }, // Faqat string qabul qiladi
    qr: { type: String, default: null },
    unit: { type: String, default: 'kg' },
    costPrice: { type: Number, default: 0 },
    
    // Plastik uchun
    volume: { type: Number, default: null },
    volumeUnit: { type: String, default: null },

    // Lab uchun
    fatContent: { type: Number, default: null },
    density: { type: Number, default: null },
    temperature: { type: Number, default: null },
    
    totalStock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Accessory', AccessoriesSchema);