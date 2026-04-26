const express = require("express");
const {CustomerController} = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js");
// Multer sozlamalarini import qilamiz

const router = express.Router();

// 'image' — bu Frontendda formData.append('image', ...) dagi kalit nomi bilan bir xil bo'lishi shart
router.post(
  "/create", 
  tenantMiddleware, 
//   upload.single('image'), // Rasm yuklash uchun middleware qo'shildi
  CustomerController.Create
);

router.post("/all", tenantMiddleware, CustomerController.GetAll);
// router.get("/get/:id", tenantMiddleware, CustomerController.GetById);



module.exports = router;