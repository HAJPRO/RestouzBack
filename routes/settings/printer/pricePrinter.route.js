const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const TemplateController = require('../../../controllers/settings/printer/pricePrinter.controller.js');

// Barcha shablonlarni olish (Filtrlar bilan ishlash uchun POST ishlatilgan)
router.post('/all',authMiddleware, TemplateController.GetAll);

// Yangi shablon yaratish
router.post('/create',authMiddleware, TemplateController.Create);

// Shablonni tahrirlash (ID body orqali yoki params orqali kelishiga qarab)
router.post('/update',authMiddleware, TemplateController.Update);

// Shablon detallarini olish
router.post('/detail',authMiddleware, TemplateController.GetAll); // Odatda bitta ID bo'yicha qidiriladi

// Shablonni o'chirish
router.post('/delete',authMiddleware, TemplateController.Delete);

//Printer config
router.post('/printer_all',authMiddleware, TemplateController.GetAllPrinter);

module.exports = router;