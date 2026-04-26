const express = require("express");
const {EmployeeController} = require("../../../controllers/index.controller.js");

const authMiddleware = require("../../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../../middlewares/db/tenant.middleware.js");
// Multer sozlamalarini import qilamiz

const router = express.Router();

// 'image' — bu Frontendda formData.append('image', ...) dagi kalit nomi bilan bir xil bo'lishi shart
router.post(
  "/create", 
  tenantMiddleware, 
//   upload.single('image'), // Rasm yuklash uchun middleware qo'shildi
  EmployeeController.Create
);

router.post("/all", tenantMiddleware, EmployeeController.GetAll);
// router.get("/get/:id", tenantMiddleware, EmployeeController.GetById);



module.exports = router;