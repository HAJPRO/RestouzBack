const { getTenantDB } = require("./dbManager.middleware.js");
const initModels = require("../../models/initModels.js");

const tenantMiddleware = async (req, res, next) => {
    try {
        // 1. dbName ni olish (avval header, keyin body)
        const dbName = req.headers['x-tenant-id'] || req.body.companyCode || "safymilk";
        // 2. Agar dbName umuman bo'lmasa, xato qaytarish (Crash bo'lishidan oldin to'xtatish)
        if (!dbName) {
             return res.status(400).json({ 
                 message: "Tenant ID (companyCode) taqdim etilmadi!" 
             });
        }

        // 3. Bazaga ulanishni olish
        const db = await getTenantDB(dbName);

        // 4. Modellarni ulanishga biriktirish
        req.tenantModels = initModels(db);

        next();
    } catch (error) {
        console.error("❌ Middleware Xatosi:", error.message);
        res.status(500).json({ 
            message: "Bazaga ulanishda texnik xatolik", 
            error: error.message 
        });
    }
};

module.exports = tenantMiddleware;