const mongoose = require('mongoose');
const tenantConnections = {};

const getTenantDB = async (dbName) => {
    // Agar tenantId kelmasa, default baza
    const finalDbName = (dbName && dbName.trim() !== '') ? dbName.trim() : "restouz";

    // 1. Keshni tekshirish
    if (tenantConnections[finalDbName] && tenantConnections[finalDbName].readyState === 1) {
        return tenantConnections[finalDbName];
    }

    const env = (process.env.NODE_ENV || 'development').trim().toLowerCase();
    const isProd = env === 'production';
    
    // Muhitga qarab bazani tanlash
    const baseUrl = isProd ? process.env.SERVER_DB_BASE : process.env.ATLAS_DB_BASE;
    const options = isProd ? process.env.SERVER_DB_OPTS : process.env.ATLAS_DB_OPTS;

    // To'liq URL: [Host] + [Dinamik Baza Nomi] + [Parametrlar]
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const fullUrl = `${cleanBaseUrl}${finalDbName}${options || ""}`;

    try {
        const conn = await mongoose.createConnection(fullUrl, {
            autoIndex: true,
            serverSelectionTimeoutMS: 10000 
        }).asPromise();

        console.log(`✅ [${isProd ? 'SERVER' : 'ATLAS'}] ulandi: ${finalDbName}`);
        
        tenantConnections[finalDbName] = conn;
        return conn;
    } catch (err) {
        console.error(`❌ DB ulanish xatosi (${finalDbName}):`, err.message);
        throw err; 
    }
};

module.exports = { getTenantDB };