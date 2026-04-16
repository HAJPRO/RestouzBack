const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  companyCode: { type: String, required: true, unique: true }, // 'buxoro_servis'
  dbName: { type: String, required: true },                   // 'db_buxoro_servis'
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});


module.exports = TenantSchema;