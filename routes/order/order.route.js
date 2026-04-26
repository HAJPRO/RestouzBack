const express = require("express");
const {OrderController} = require("../../controllers/index.controller.js");

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
  OrderController.Create
);

router.post("/all", tenantMiddleware, OrderController.GetAll);
router.post("/payment", tenantMiddleware, OrderController.SubmitPayment);
// router.get("/get/:id", tenantMiddleware, OrderController.GetById);



module.exports = router;