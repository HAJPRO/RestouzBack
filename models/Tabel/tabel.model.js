const { model, Schema } = require("mongoose");

const TabelSchema = new Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true, // Masalan: 'admin', 'manager'
    },
    capacity: {
      type: String,
      required: true,
    },
     position: {
      type: String,
      required: true,

    },
    status: {
  type: String,
  required: true,
  enum: ["0", "1", "2", "3", "-1"],
  default: "0",
  // Izohlar:
  // "0"  -> Bo'sh (available)
  // "1"  -> Band (occupied)
  // "2"  -> Bron (reserved)
  // "3"  -> hisob kutmoqda (waiting for payment)
  // "-1" -> ta'mirda (under repair)
},
    
    description: {
      type: String,
    },
    timer : {
        type: String,
        default: "0"
    },
    total : {
        type: String,
        default: "0"
    },
    bookings: [{
      type: Schema.Types.ObjectId,
      ref: "Booking" 
    }] 





//    position: [{
//       type: Schema.Types.ObjectId,
//       ref: "Permission" // Permission modeli nomi bilan bir xil bo'lishi kerak
//     }],
  }, {
  timestamps: true,
}
);

module.exports = TabelSchema;
