const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../middlewares/admin.middleware.js");

const {UserController} = require("../../controllers/index.controller.js");

const {
    permissionAddValidator,
} = require("../../helpers/admin/permissionValidator");

// router.post(
//     "/create",
//     authMiddleware,
//     UserController.Create
// );

router.post(
    "/all",
    authMiddleware,
    UserController.GetUsers
);

module.exports = router;
