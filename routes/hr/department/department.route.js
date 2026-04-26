const express = require("express");
const {DepartmentController} = require("../../../controllers/index.controller.js");

const authMiddleware = require("../../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../../middlewares/db/tenant.middleware.js");

const router = express.Router();

router.post(
  "/create", 
  tenantMiddleware, 
  // authMiddleware, // Agar login qilgan bo'lishi shart bo'lsa, buni yoqing
  DepartmentController.Create
);


router.post(
  "/all", 
  tenantMiddleware, 
  DepartmentController.GetAll
);
router.get(
  "/get/:id", 
  tenantMiddleware, 
  DepartmentController.GetById
);

/**
 * @route   DELETE /api/department/delete/:id
 * @desc    Bo'limni o'chirish
 */
router.delete(
  "/delete/:id", 
  tenantMiddleware, 
  DepartmentController.Delete
);

module.exports = router;