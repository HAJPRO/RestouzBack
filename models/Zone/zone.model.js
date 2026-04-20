const { Schema } = require("mongoose");

const ZoneSchema = new Schema({
  // Hudud nomi (masalan: 1-qavat, VIP zal, Yozgi ayvon)
  name: {
    type: String,
    required: [true, "Hudud nomi kiritilishi shart"],
    trim: true,
    unique: true 
  },

  // Hudud kodi (masalan: Z-01, TERRACE)
  code: {
    type: String,
    trim: true,
    uppercase: true
  },

  // Hudud uchun mas'ul xodim (ofitsiant yoki administrator)
  manager: {
    type: String,
    trim: true,
    default: "Tayinlanmagan"
  },

  // Hudud haqida qo'shimcha ma'lumot
  description: {
    type: String,
    trim: true
  },

  // Hudud holati (Ochiq yoki yopiq)
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  // Saralash tartibi (Interfeysda zallarni qaysi ketma-ketlikda ko'rsatish uchun)
  order: {
    type: Number,
    default: 1
  },

  // Hududga biriktirilgan stollar soni (Kesh sifatida saqlash uchun)
  tableCount: {
    type: Number,
    default: 0
  },

  // Hududning vizual rangi (UI da stollarni ajratib ko'rsatish uchun hex-code)
  color: {
    type: String,
    default: "#4f46e5" // Default indigo rang
  }
}, {
  timestamps: true // createdAt va updatedAt maydonlarini avtomatik qo'shadi
});

// Qidiruvni tezlashtirish uchun indekslar
ZoneSchema.index({ name: 1, status: 1 });

module.exports = ZoneSchema;