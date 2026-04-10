const express = require("express");
const MenuController = require("../../controllers/Menu/menu.controller.js");
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

module.exports = router;