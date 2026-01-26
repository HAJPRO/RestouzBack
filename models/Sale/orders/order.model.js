const { model, Schema } = require("mongoose");
const OrderSchema = new Schema(
  {
    products: [
      {
        id: { type: String },
        pro_name: { type: String, required: true },
        pro_type: { type: String },
        pro_quantity: { type: Number, required: true },
        pro_unit: { type: String, required: true },
        packingType: { type: String, required: true },
        pro_price: { type: Number, required: true },
        pro_total_price: { type: Number, required: true },
      },
    ],
    driverSentToTime: { type: Date },
    deliveryTime: { type: Date },
    driverAcceptedTime: { type: Date },
    driverArrivedTime: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderNumber: { type: String, required: true, unique: true },
    totalAmount: { type: Number, required: true },
    mixedDetails :{type:Array,default:[]},
    status: {
      type: String,
      enum: [
        "Yangi buyurtma",
        "Haydovchiga yuborilmoqda",
        "Haydovchiga yuborildi",
        "Yetkazib berilmoqda",
        "Yetkazib berildi",
        "Bekor qilindi",
      ],
      default: "Yangi buyurtma",
    },
    state: { type: String }, // kerak bo‘lsa enum qilsa bo‘ladi
    isSent: {
      type: Boolean,
      default: false,
    },
    driverLocation: {
      lat: { type: Number },
      long: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Order", OrderSchema);
