const RawMaterialService = require('../../../services/Supply/rawmaterial/rawmaterial.service');

exports.createRawMaterial = async (req, res) => {
    try {
        const material = await RawMaterialService.create(req.body);
        res.status(201).json({ success: true, data: material, message: "Xomashyo yaratildi" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await RawMaterialService.getAll(req.body.filter);
        res.status(200).json({ success: true, data: materials });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server xatosi" });
    }
};

exports.getDetail = async (req, res) => {
    try {
        const material = await RawMaterialService.getById(req.body.id);
        if (!material) return res.status(404).json({ success: false, message: "Topilmadi" });
        res.status(200).json({ success: true, data: material });
    } catch (error) {
        res.status(400).json({ success: false, message: "ID noto'g'ri" });
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        await RawMaterialService.delete(req.body.id);
        res.status(200).json({ success: true, message: "Xomashyo o'chirildi" });
    } catch (error) {
        res.status(400).json({ success: false, message: "O'chirishda xato" });
    }
};