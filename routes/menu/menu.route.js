const express = require("express");
const {MenuController} = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");
// Multer sozlamalarini import qilamiz
const upload = require("../../middlewares/multer.middleware.js"); 

const router = express.Router();

// 'image' — bu Frontendda formData.append('image', ...) dagi kalit nomi bilan bir xil bo'lishi shart
router.post(
  "/create", 
  tenantMiddleware, 
//   upload.single('image'), // Rasm yuklash uchun middleware qo'shildi
  MenuController.Create
);

router.post("/all", tenantMiddleware, MenuController.GetAll);
router.get("/get/:id", tenantMiddleware, MenuController.GetById);

router.post("/category/create", tenantMiddleware, MenuController.CreateCategory);
router.post("/category/all", tenantMiddleware, MenuController.GetAllCategories);

// Cart uchun endpointlar
router.post("/order/create", tenantMiddleware, MenuController.CreateOrder);
router.post("/order/update", tenantMiddleware, MenuController.UpdateOrder);
// router.get("/order/get/:id", tenantMiddleware, MenuController.GetOrderById);
// router.get("/order/all", tenantMiddleware, MenuController.GetAllOrders);

module.exports = router;