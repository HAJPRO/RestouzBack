const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const AccessoriesController = require('../../../controllers/supply/accessories/accessory.controller.js');

// Siz yuborgan frontend andozaga mos endpointlar
router.post('/create', AccessoriesController.saveMaterial);
router.post('/all', AccessoriesController.getAllMaterials);
router.post('/detail', AccessoriesController.getDetail);
router.post('/delete', AccessoriesController.deleteMaterial);

// Skaner uchun
// router.post('/by-code', async (req, res) => {
//     const RawMaterialService = require('../services/rawMaterial.service');
//     const material = await RawMaterialService.getByCode(req.body.code);
//     if(material) res.json({ success: true, data: material });
//     else res.status(404).json({ success: false, message: "Kod topilmadi" });
// });

module.exports = router;