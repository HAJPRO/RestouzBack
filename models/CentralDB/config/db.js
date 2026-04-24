const mongoose = require('mongoose');
const TenantSchema = require('../CentralTenant.model.js');

// 1. Markaziy (Master) ulanishni yaratish
const centralDbConnection = mongoose.createConnection(process.env.CENTRAL_DB_URI, {
    // Zarur bo'lsa pool size va boshqa opts'lar
    maxPoolSize: 1000
});

centralDbConnection.on('connected', () => console.log('✅ Central DB-ga ulandi'));
centralDbConnection.on('error', (err) => console.error('❌ Central DB xatosi:', err));

// 2. Modelni ushbu ulanishga biriktirish
const CentralTenantModel = centralDbConnection.model('Tenant', TenantSchema);

// 3. Ikkalasini ham bitta obyektda eksport qilish
module.exports = { 
    centralDbConnection, 
    CentralTenantModel 
};