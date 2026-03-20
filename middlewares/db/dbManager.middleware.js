const mongoose = require('mongoose');
const tenantConnections = {};

const getTenantDB = async (dbName) => {
    const finalDbName = (typeof dbName === 'string' && dbName.trim() !== '') ? dbName.trim() : "safymilk";

    if (tenantConnections[finalDbName]) {
        return tenantConnections[finalDbName];
    }

    const baseUrl = process.env.DB_URL_BASE || "mongodb://127.0.0.1:27017/";
    const fullUrl = baseUrl.endsWith('/') ? `${baseUrl}${finalDbName}` : `${baseUrl}/${finalDbName}`;

    try {
        const conn = await mongoose.createConnection(fullUrl, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000 
        }).asPromise();

        console.log(`✅ Yangi baza ulandi: ${finalDbName}`);
        tenantConnections[finalDbName] = conn;
        return conn;
    } catch (err) {
        console.error(`❌ DB ulanish xatosi (${finalDbName}):`, err.message);
        throw err; 
    }
};

module.exports = { getTenantDB };