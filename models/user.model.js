  const { model, Schema } = require("mongoose");

  const userSchema = new Schema(
    {
      companyCode: { type: String },
      department: { type: String },
      isActivated: { type: Boolean, default: false },
      chatId: {
        type: String,
      },
      action: {
        type: String,
       
        default: "register",
      },


      fullname: {
        type: String,

        trim: true,
      },
      // gender: {
      //   type: String,
      //   enum: ["Erkak", "Ayol"],

      // },
      age: {
        type: String,
      },
      username: {
        type: String,

      },
      password: {
        type: String,
      },
      phoneNumber: {
        type: String,
        trim: true
      },
      // passportNumber: {
      //   type: String,
      // },
      // inn: {
      //   type: String,
      // },
      // email: {
      //   type: String,
      // },
      // telegram: {
      //   type: String,
      // },


      address: {
        region: { type: String, default: 0 },
        district: { type: String, default: 0 },
        neighborhood: { type: String, default: 0 },
        street: { type: String, default: 0 },
        house: { type: String, default: 0 },
      },
      roles: [{
        type: Schema.Types.ObjectId, ref: "Role"
      }],

      position: {
        type: String,
        // enum: ["Yosh haydovchi", "O'rta haydovchi", "Katta haydovchi"],
        // default: "Haydovchi",
      },
      status: {
        type: String,
        enum: ["online", "offline", "band", "kutmoqda"],
        default: "offline"
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      registeredAt: {
        type: Date,
        default: Date.now,
      },

      // Qo'shilgan maydonlar
      // driverLicenseNumber: {
      //   type: String,
      // },
      // driverLicenseDate: {
      //   type: Date,
      // },
      carNumber: {
        type: String,
      },
      carType: {
        type: String,
        // enum: ["Damas", "Labo", "Porter", "Mers", "BMW", "Gentra","Boshqa"],
      },
      carColor: {
        type: String,
        // enum: ["Qora", "Oq", "Qizil", "Yashil", "Moviy", "Boshqa"],
      },
      profileImage: {
        type: String,
        default: "default_image_url",
      },
      vehicleCapacity: {
        type: Number,
        min: 1,
      },
      lastLocation: {
        type: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
        default: { latitude: 0, longitude: 0 },
      },
      location: {
        type: {
          lat: { type: Number },
          long: { type: Number },
        },
        default: { lat: 0, long: 0 },
      },
      workingHours: {
        type: {
          start: { type: Date },
          end: { type: Date },
        },
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
      notes: {
        type: String,
        default: "",
      },

    },
    { timestamps: true }
  );
  module.exports = userSchema;
