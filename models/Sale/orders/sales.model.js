const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const SaleHistorySchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true }, // Majburiy va unikal
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name : {type: String},
    quantity: {type:String},
    salePrice: {type:String}, // Sotilgan narxi
    costPrice: {type:String}, // Kelgan narxi (Foyda uchun)
    partyNumber:{type:String},
    unit : { type: String, default: "dona" }
  }],
  totalAmount: {type:String}, // Jami summa
  paymentType: { type: String, default: 'cash' },
  mixedDetails :{type:Array,default:[]},
  branchId: {type:String},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  status : {type:String,default:"Kutilmoqda"},
  isSentDriver : {type:Boolean, default:false},
  driverAcceptedTime : {type : Date},
  driverArrivedTime : {type : Date}
},{ timestamps: true });
SaleHistorySchema.index({ "items.partyNumber": 1 });
module.exports = model("Sales", SaleHistorySchema);