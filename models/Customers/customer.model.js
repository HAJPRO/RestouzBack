const { model, Schema } = require("mongoose");
const CustomerSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  discription: { type: String },
  phoneNumber: {
    type: String,
    trim: true,
    required: true
  },
  address: {
    region: { type: String, required: true },
    district: { type: String, required: true },
    neighborhood: { type: String, required: true },
    street: { type: String, required: true },
    house: { type: String },
  },
  location: {
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
  },
  is_location: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["Aktiv", "offline", "band", "kutmoqda"],
    default: "Aktiv",
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  ratings: {
    type: [Number],
    default: [],
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  completedOrders: {
    type: Number,
    default: 0,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },

  // category: { type: String, required: true },
  // artikul: {
  //   type: String,
  //   trim: true,
  //   required: true,
  // },
  // position: {
  //   type: String,
  //   enum: ["Tilla", "Kumush", "Bronza"],
  //   trim: true,
  // },
  // registeredAt: { type: Date, default: new Date(), required: true },
  // imageUrl: { type: String },

  // inn: { type: String },

  // passportNumber: {
  //   type: String,
  //   unique: true,
  // },

  // email: { type: String },
  // telegram: { type: String },



}, { timestamps: true });

module.exports =  CustomerSchema;
