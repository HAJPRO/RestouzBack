const express = require("express");
const { StatisticsController } = require("../../../controllers/index.controller.js");
const tenantMiddleware = require("../../../middlewares/db/tenant.middleware.js");

const router = express.Router();

/**
 * @route   GET /api/statistics/dashboard
 * @desc    Umumiy tushum, o'rtacha chek, grafik va to'lov turlari
 */
router.get(
  "/dashboard", 
  tenantMiddleware, 
  StatisticsController.GetDashboardStats
);

/**
 * @route   GET /api/statistics/top-sales
 * @desc    Eng ko'p sotilgan mahsulotlar reytingi
 */
router.get(
  "/top-sales", 
  tenantMiddleware, 
  StatisticsController.GetTopSales
);

/**
 * @route   GET /api/statistics/top-customers
 * @desc    Eng ko'p xarid qilgan mijozlar reytingi
 */
router.get(
  "/top-customers", 
  tenantMiddleware, 
  StatisticsController.GetTopCustomers
);

module.exports = router;