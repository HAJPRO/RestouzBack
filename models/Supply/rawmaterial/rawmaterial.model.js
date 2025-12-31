const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // Shtrixkod yoki ID
    name: { type: String, required: true },
    image: { type: String, default: null },
    qr: { type: String, default: null },
    unit: { type: String, default: 'Litr' }, // Litr, Kg
    costPrice: { type: Number, default: 0 }, // O'rtacha xarid narxi
    
    // Laboratoriya ko'rsatkichlari (Oxirgi tahlil bo'yicha)
    fatContent: { type: Number, default: 0 },  // Yog'lilik %
    density: { type: Number, default: 0 },     // Zichlik
    temperature: { type: Number, default: 0 },  // Harorat
    
    totalStock: { type: Number, default: 0 },  // Ombordagi jami qoldiq
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);