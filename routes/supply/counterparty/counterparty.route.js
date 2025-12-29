const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../../../middlewares/auth.middleware.js");
// Agar faqat admin yoki ma'lum huquqli xodimlar yetkazib beruvchilar bilan ishlasa, buni ham qo'shish mumkin
// const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");

const CounterpartyController = require("../../../controllers/supply/counterparty/counterparty.controller.js");

// Kontragent yaratish yoki yangilash
router.post(
  "/create",
  authMiddleware, 
  CounterpartyController.Save
);

// Barcha kontragentlar ro'yxati
router.post(
  "/all",
  authMiddleware, 
  CounterpartyController.GetAll
);

// Kontragentni o'chirish
router.post(
  "/delete",
  authMiddleware, 
  CounterpartyController.DeleteById
);

// Bitta kontragent ma'lumotlarini olish (Detail)
router.post(
  "/detail",
  authMiddleware, 
  CounterpartyController.GetById
);

// Kontragentning sut topshirish (Kirimlar) tarixi
router.post(
  "/inbounds",
  authMiddleware, 
  CounterpartyController.GetInboundsBySupplierId
);

// Hisobotlarni Excel formatda yuklab olish
router.post(
  "/export-excel",
  authMiddleware, 
  CounterpartyController.ExportExcelDownload
);

module.exports = router;