const { model, Schema } = require("mongoose");

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Masalan: 'admin', 'manager'
    },
    value: {
      type: String,
      required: true,
      unique: true, // Masalan: 'admin', 'manager'
    },
    description: {
      type: String,
    },
   permissions: [{
      type: Schema.Types.ObjectId,
      ref: "Permission" // Permission modeli nomi bilan bir xil bo'lishi kerak
    }],
  }, {
  timestamps: true,
}
);

module.exports = RoleSchema;
