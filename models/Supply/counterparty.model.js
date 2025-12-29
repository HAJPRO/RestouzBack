const { model, Schema } = require("mongoose");

const CounterpartySchema = new Schema({
    image : {
         type: String,
    
    },
    qr :{
       type: String,  
    },
    //code
  code: {
    type: String,
    required: true,
    trim: true,
  },
  // F.I.O yoki Korxona nomi
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Kontragent turi: Yuridik shaxs (Fermer) yoki Jismoniy shaxs (Aholi)
  type: {
    type: String,
    enum: ["legal", "physical"],
    default: "physical",
    required: true
  },

  // STIR (INN) - Yuridik shaxslar uchun majburiy bo'lishi mumkin
  inn: {
    type: String,
    trim: true,
    default: ""
  },

  phoneNumber: {
    type: String,
    trim: true,
    required: true
  },

  // Bank rekvizitlari (To'lovlarni o'tkazish uchun)
  bank_details: {
    bank_name: { type: String, default: "" },
    bank_account: { type: String, default: "" }, // MFO va Hisob raqam
  },

  // Shartnoma ma'lumotlari
  contract: {
    number: { type: String, default: "" },
    date: { type: Date },
    milk_price: { type: Number, default: 0 }, // 1 litr sut uchun kelishilgan narx
  },

  address: {
    region: { type: String, required: true },
    district: { type: String, required: true },
    neighborhood: { type: String },
    street: { type: String },
    house: { type: String },
  },

  location: {
    lat: { type: Number },
    long: { type: Number },
  },
  
  is_location: { type: Boolean, default: false },

  discription: { type: String },

  // Holati
  status: {
    type: String,
    enum: ["Aktiv", "Noaktiv", "Arxiv"],
    default: "Aktiv",
  },

  // Balans (Buxgalteriya uchun)
  // Musbat bo'lsa - biz ulardan qarzdormiz (sut bergan, pulini olmagan)
  // Manfiy bo'lsa - ular bizdan qarzdor (avans olgan)
  balance: {
    type: Number,
    default: 0
  },

  // Statistika
  totalInbounds: { // Jami necha marta sut topshirgan
    type: Number,
    default: 0,
  },
  totalLiters: {   // Jami necha litr sut topshirgan
    type: Number,
    default: 0,
  },

}, { timestamps: true });

// Qidiruvni tezlashtirish uchun indekslar
// SupplierSchema.index({ fullname: "text", phoneNumber: 1, inn: 1 });

module.exports = model("Counterparty", CounterpartySchema);