const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const RawmaterialController = require('../../../controllers/supply/rawmaterial/rawmaterial.controller.js');

// Siz yuborgan frontend andozaga mos endpointlar
router.post('/create', RawmaterialController.saveMaterial);
router.post('/all', RawmaterialController.getAllMaterials);
router.post('/detail', RawmaterialController.getDetail);
router.post('/delete', RawmaterialController.deleteMaterial);

// Skaner uchun
router.post('/by-code', async (req, res) => {
    const RawMaterialService = require('../services/rawMaterial.service');
    const material = await RawMaterialService.getByCode(req.body.code);
    if(material) res.json({ success: true, data: material });
    else res.status(404).json({ success: false, message: "Kod topilmadi" });
});

module.exports = router;