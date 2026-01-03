const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const SupplyInboundController = require("../../../controllers/supply/inbound/inbound.controller.js");

/**
 * LABORATORIYA QABULI (INBOUND) ROUTELARI
 */

// 1. Yangi qabulni saqlash (Kirim yaratish)
// POST metodidan foydalaniladi
router.post(
  "/create",
  authMiddleware, 
  SupplyInboundController.create
);

// // 2. Barcha kirimlar ro'yxati (Filtrlar bilan)
// // Ma'lumot olish bo'lgani uchun GET metodidan foydalanish professionalroq
router.post(
  "/all",
  authMiddleware, 
  SupplyInboundController.GetAll // Inbound controllerdan olinadi
);
router.post('/labanalysis', authMiddleware, SupplyInboundController.saveLabAnalysis);
// // 3. Bitta qabul hujjati tafsiloti (Detail)
// router.get(
//   "/detail/:id",
//   authMiddleware, 
//   SupplyInboundController.GetById
// );

// // 4. Ma'lum bir fermerning barcha topshirgan mahsulotlari tarixi
// router.get(
//   "/history/:supplierId",
//   authMiddleware, 
//   SupplyInboundController.GetInboundsBySupplierId
// );

// // 5. Kirimni bekor qilish yoki o'chirish
// // POST yoki DELETE metodidan foydalanish mumkin
// router.post(
//   "/delete",
//   authMiddleware, 
//   SupplyInboundController.DeleteById
// );

// // 6. Eksport mantiqi (Excel hisobotlar uchun)
// router.post(
//   "/export-excel",
//   authMiddleware, 
//   SupplyInboundController.ExportExcelDownload
// );

module.exports = router;