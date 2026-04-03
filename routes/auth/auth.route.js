const express = require("express");
const authController = require("../../controllers/Auth/auth.controller.js");
// const { body } = require("express-validator");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js"); // Yangi middleware

const router = express.Router();

router.post("/register", authController.register);
router.get("/activation/:id", authController.activation);
router.post("/login", tenantMiddleware, authController.login);
router.post("/update", authController.update);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refresh);
router.get("/get-users", authController.getUser);

module.exports = router;
