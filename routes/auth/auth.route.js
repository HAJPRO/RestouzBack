const express = require("express");
const {AuthController} = require("../../controllers/index.controller.js");

// const { body } = require("express-validator");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js"); // Yangi middleware

const router = express.Router();

router.post("/register", AuthController.register);
router.get("/activation/:id", AuthController.activation);
router.post("/login", tenantMiddleware, AuthController.login);
router.post("/update", AuthController.update);
router.post("/logout", AuthController.logout);
router.get("/refresh", AuthController.refresh);
router.get("/get-users", AuthController.getUser);

module.exports = router;
