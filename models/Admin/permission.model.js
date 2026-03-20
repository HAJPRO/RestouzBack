const { model, Schema } = require("mongoose");

const PermissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Masalan: 'user:create'
    },
    value: {
      type: String,
      required: true,
      unique: true, // Masalan: 'user:create'
    },
    description: {
      type: String,
      required: false,
    },
  }, {
  timestamps: true,
}
);

module.exports = PermissionSchema;
