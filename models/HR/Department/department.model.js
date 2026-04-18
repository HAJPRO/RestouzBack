const { Schema } = require("mongoose");

const DepartmentSchema = new Schema({
  // Bo'lim nomi (masalan: Oshxona, Buxgalteriya, Xizmat ko'rsatish)
  name: {
    type: String,
    required: [true, "Bo'lim nomi kiritilishi shart"],
    trim: true,
    unique: true // Bir xil nomli bo'limlar bo'lmasligi uchun
  },

  // Bo'lim kodi yoki identifikatori (masalan: B-01, ADMIN-01)
  code: {
    type: String,
    trim: true,
    uppercase: true
  },

  // Bo'lim rahbari yoki mas'ul shaxs ismi (string ko'rinishida)
  manager: {
    type: String,
    trim: true,
    default: "Tayinlanmagan"
  },

  // Bo'lim haqida qo'shimcha ma'lumot
  description: {
    type: String,
    trim: true
  },

  // Bo'lim holati
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  // Bo'limdagi xodimlar soni (ixtiyoriy, hisoblab borish uchun)
  // Odatda bu maydon dinamik hisoblanadi, lekin kesh sifatida saqlash ham mumkin
  employeeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Yaratilgan va tahrirlangan vaqtini saqlash uchun
});

module.exports = DepartmentSchema;