const express = require("express");
const TabelController = require("../../controllers/tabel/tabel.controller.js");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js"); // Yangi middleware

const router = express.Router();


router.post("/create", tenantMiddleware, TabelController.Create);


module.exports = router;
