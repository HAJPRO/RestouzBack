const { Schema } = require("mongoose");

const FeeSchema = new Schema(
  {
    percentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Agar kelajakda xizmat nomi o'zgarsa (masalan: "Xizmat ko'rsatish" yoki "Usluga")
    title: {
      type: String,
      default: "Xizmat haqi",
    }
  },
  {
    timestamps: true, // Qachon o'zgartirilganini bilish uchun juda muhim
  }
);

module.exports = FeeSchema;