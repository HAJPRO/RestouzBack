const express = require("express");
const {TransactionController} = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");

const router = express.Router();

/**
 * @route   POST /api/transaction/create
 * @desc    Yangi tranzaksiya yaratish (To'lov, qarz, qaytim)
 */
router.post(
  "/create", 
  authMiddleware, // Kim tranzaksiya qilayotganini aniqlash uchun shart
  tenantMiddleware, 
  TransactionController.Create
);

/**
 * @route   POST /api/transaction/all
 * @desc    Barcha tranzaksiyalarni olish (Filtrlar bilan)
 * @note    GetAll uchun ko'pincha POST ishlatiladi (murakkab filtrlar body'da kelishi uchun)
 */
router.post(
  "/all", 
  authMiddleware,
  tenantMiddleware, 
  TransactionController.GetAll
);

/**
 * @route   GET /api/transaction/get/:id
 * @desc    Bitta tranzaksiya tafsiloti
 */
router.get(
  "/get/:id", 
  authMiddleware,
  tenantMiddleware, 
  TransactionController.GetById
);

/**
 * @route   DELETE /api/transaction/delete/:id
 * @desc    Tranzaksiyani bekor qilish (Admin huquqi bilan bo'lishi tavsiya etiladi)
 */
router.delete(
  "/delete/:id", 
  authMiddleware,
  tenantMiddleware, 
  TransactionController.Delete
);

module.exports = router;