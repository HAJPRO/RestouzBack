const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const LaboratoryAnaliticController = require("../../../controllers/laboratory/analitic/analitic.controller.js");

/**
 * LABORATORIYA QABULI (INBOUND) ROUTELARI
 */

// 1. Yangi qabulni saqlash (Kirim yaratish)
// POST metodidan foydalaniladi
// router.post(
//   "/create",
//   authMiddleware, 
//   LaboratoryAnaliticController.create
// );


// // 2. Barcha kirimlar ro'yxati (Filtrlar bilan)
// // Ma'lumot olish bo'lgani uchun GET metodidan foydalanish professionalroq
router.post(
  "/all",
  authMiddleware, 
  LaboratoryAnaliticController.GetAll // Inbound controllerdan olinadi
);
router.post(
  "/generatepdf",
  authMiddleware, 
  LaboratoryAnaliticController.GeneratePdf // Inbound controllerdan olinadi
);

module.exports = router;