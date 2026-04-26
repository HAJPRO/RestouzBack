const express = require("express");
const {TabelController} = require("../../controllers/index.controller.js");

const authMiddleware = require("../../middlewares/auth.middleware.js");
const tenantMiddleware = require("../../middlewares/db/tenant.middleware.js"); // Yangi middleware

const router = express.Router();


router.post("/create", tenantMiddleware, TabelController.Create);
router.post("/all", tenantMiddleware, TabelController.GetAll);
router.get("/get/:id", tenantMiddleware, TabelController.GetById);
///Booking route
router.post("/booking/create/:id", tenantMiddleware, TabelController.CreateBooking);
router.get("/booking/get/:id", tenantMiddleware, TabelController.GetTableBookings);

module.exports = router;
