const express = require("express");
const {ZoneController} = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");

const router = express.Router();

/**
 * @route   POST /api/structure/zone/create
 * @desc    Yangi hudud yaratish yoki mavjudini tahrirlash
 */
router.post(
  "/create", 
  tenantMiddleware, 
  // authMiddleware, // Xavfsizlik uchun bu middlewareni yoqish tavsiya etiladi
  ZoneController.Create
);

/**
 * @route   POST /api/structure/zone/all
 * @desc    Barcha hududlar ro'yxatini olish
 */
router.post(
  "/all", 
  tenantMiddleware, 
  ZoneController.GetAll
);

/**
 * @route   GET /api/structure/zone/get/:id
 * @desc    ID bo'yicha hudud ma'lumotlarini olish
 */
router.get(
  "/get/:id", 
  tenantMiddleware, 
  ZoneController.GetById
);

/**
 * @route   DELETE /api/structure/zone/delete/:id
 * @desc    Hududni o'chirish
 */
router.delete(
  "/delete/:id", 
  tenantMiddleware, 
  ZoneController.Delete
);

module.exports = router;