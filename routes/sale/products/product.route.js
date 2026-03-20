const express = require("express");
const router = express.Router();

// Middlewarelar
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const authorize = require("../../../middlewares/authorize.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const upload = require("../../../middlewares/multer.middleware.js");

// Controller
const ProductManagmentController = require("../../../controllers/sale/products/product.controller.js");
const tenantMiddleware = require("../../../middlewares/db/tenant.middleware.js");

// --- 1. Yaratish (POST) ---
// upload.single("image") - Frontend'dagi FormData kaliti bilan bir xil bo'lishi shart
router.post(
  "/", 
  authMiddleware, 
  upload.single("image"), 
  ProductManagmentController.create
);

// --- 2. O'zgartirish (PUT) ---
router.put(
  "/:id", 
  authMiddleware, 
  upload.single("image"), 
  ProductManagmentController.update
);

// --- 3. Boshqa operatsiyalar ---

// Hammasini olish
router.get(
  "/", 
  authMiddleware, 
  ProductManagmentController.getAll
);

// Bittasini olish
router.get(
  "/:id", 
  authMiddleware, 
  ProductManagmentController.getOne
);

// O'chirish
router.delete(
  "/:id", 
  authMiddleware, 
  authorize({ 
    roles: ['1000'], 
    permissions: [] 
  }),
  ProductManagmentController.delete
);

// Excel Export
router.post(
  "/excel",
  authMiddleware, 
  ProductManagmentController.handleExcelExport
);

module.exports = router;