const { getTenantDB } = require("./dbManager.middleware.js");
const initModels = require("../../models/initModels.js");

const tenantMiddleware = async (req, res, next) => {
    try {
        /**
         * 1. dbName ni olish.
         * MUHIM: Base64 kabi katta ma'lumotlar kelganda req.body'dan foydalanmaslik kerak.
         * Chunki body hali to'liq stream qilib bo'linmagan bo'lishi mumkin.
         * Frontend'dan doim 'x-tenant-id' header'ini yuboring.
         */
        const dbName = req.headers['x-tenant-id'] || "restouz"; 

        // 2. Agar dbName bo'lmasa, so'rovni shu yerda to'xtatamiz
        if (!dbName) {
            return res.status(400).json({ 
                success: false,
                message: "Tenant ID (x-tenant-id header) taqdim etilmadi!" 
            });
        }

        // 3. Bazaga ulanishni olish (Keshdan yoki yangi ulanish)
        const db = await getTenantDB(dbName);

        if (!db) {
            return res.status(404).json({
                success: false,
                message: `Baza topilmadi: ${dbName}`
            });
        }

        // 4. Modellarni ulanishga biriktirish
        // Endi req.tenantModels orqali barcha modellarga (Menu, User va h.k.) kirish mumkin
        req.tenantModels = initModels(db);
        
        // Tenant ma'lumotlarini req obyektida saqlab qo'yish (keyinchalik ishlatish uchun)
        req.tenantId = dbName;

        next();
    } catch (error) {
        console.error("❌ tenantMiddleware Xatosi:", error.message);
        
        // Xatolikni errorMiddleware'ga uzatish o'rniga, shu yerda aniq javob qaytaramiz
        return res.status(500).json({ 
            success: false,
            message: "Bazaga ulanishda texnik xatolik yuz berdi", 
            error: error.message 
        });
    }
};

module.exports = tenantMiddleware;