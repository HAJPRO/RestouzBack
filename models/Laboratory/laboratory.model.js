const { model, Schema } = require("mongoose");
const LabAnalysisSchema = new Schema({
  partyNumber : {type:String},
  // Birlashtirilgan partiyalar ID lari
  inboundBatchIds: [{
    type: Schema.Types.ObjectId,
    ref: 'SupplyInbound'
  }],
  
  // Tahlil natijalari
  results: {
    fat: Number,
    density: Number,
    acidity: Number,
    quality: String
  },
  
  // Mahsulotlarga taqsimot
  distribution: {
    type: Map,
    of: Number // { "Smetana 20%": 150, "Qatiq 3.2%": 300 ... }
  },
  
  // Kim bajardi (Author)
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status :{type:String, default:"Qabul qilindi"},
  state : {type:Boolean, default:true}
}, { timestamps: true });
module.exports = model("Laboratory", LabAnalysisSchema);