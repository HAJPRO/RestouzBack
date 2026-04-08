const { model, Schema } = require("mongoose");

const BookingSchema = new Schema(
  {
    // Qaysi stol band qilinmoqda?
    table_id: {
      type: Schema.Types.ObjectId,
      ref: "Table", // Stol modeli bilan bog'lanish
      required: true,
    },
    // Mijoz ma'lumotlari
    client_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // Necha kishi kelishi
    guests_count: {
      type: Number,
      required: true,
      default: 1,
    },
    // Mas'ul xodim (Ofitsiant)
    waiter_id: {
      type: Schema.Types.ObjectId,
      ref: "User", // Xodimlar modeli bilan bog'lanish
      default: null,
    },
    // Band qilingan vaqt (Mijoz qachon keladi)
    booking_time: {
      type: Date,
      required: true,
    },
    // Qo'shimcha izoh (Description)
    description: {
      type: String,
      trim: true,
    },
    // Band qilish holati
    status: {
      type: String,
      enum: ["0", "1", "2", "3", "4"],
      default: "0",
    },
    // Oldindan to'lov summasi
    prepayment: {
      type: Number,
      default: 0,
    },
    // To'lov turi (Naqd, Karta va h.k.)
    payment_method: {
      type: String,
      enum: ["cash", "card", "online", "none"],
      default: "none",
    },
  },
  {
    timestamps: true, // createdAt va updatedAt maydonlarini qo'shadi
  }
);
module.exports = BookingSchema;
