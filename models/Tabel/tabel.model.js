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
        enum: ["0", "1", "2","3","-1"],
        default: "0" // Masalan: 'available', 'occupied', 'reserved'
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
    }





//    position: [{
//       type: Schema.Types.ObjectId,
//       ref: "Permission" // Permission modeli nomi bilan bir xil bo'lishi kerak
//     }],
  }, {
  timestamps: true,
}
);

module.exports = TabelSchema;
