const { model, Schema } = require("mongoose");
const userPermissionSchema = new Schema(
  {
    user_id: {
      // type: mongoose.Schema.Types.ObjectId,
      type: Schema.ObjectId,
      required: true,
      ref: "User",
    },
    permissions: [
      {
        permission_name: String,
        permission_value: [Number],
      },
    ],
  },
  { timestamps: true }
);

module.exports =  userPermissionSchema;
