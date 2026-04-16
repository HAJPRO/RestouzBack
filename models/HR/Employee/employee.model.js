const { Schema } = require("mongoose");
const EmployeeSchema = new Schema({
  // Shaxsiy ma'lumotlar
  firstname: {
    type: String,
    required: [true, "Ism kiritilishi shart"],
    trim: true
  },
  lastname: {
    type: String,
    required: [true, "Familiya kiritilishi shart"],
    trim: true
  },
  image: {
    type: String, // Base64 formatida yoki rasm URL manzili
    required: [true, "Rasm yuklanishi shart"]
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  
  // Ish faoliyati
  position: {
    type: String,
    default: 'waiter',
  },
   department: {
    type: String,
    default: '',
  },
  salary: {
    type: Number,
    default: 0
  },
  phone: {
    type: String,
    required: [true, "Telefon raqami shart"],
    unique: true // Bir xil raqam bilan ikki marta ro'yxatdan o'tib bo'lmaydi
  },

 age : {
    type: String,
    default: 18, 
 },

  // Qo'shimcha maydonlar
  status: {
    type: String,
    enum: ['active', 'inactive', 'onleave'],
    default: 'active'
  }
}, {
  timestamps: true // createdAt va updatedAt maydonlarini avtomatik qo'shadi
});


module.exports = EmployeeSchema;