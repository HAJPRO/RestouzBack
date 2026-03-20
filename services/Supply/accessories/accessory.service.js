const { generateQRCode } = require('../../../utils/generater');

class AccessoriesService {
    /**
     * Yaratish va Tahrirlash mantiqi (Multi-tenant)
     * @param {Object} req - Request obyekti (tenantModels uchun)
     * @param {Object} data - { action: "create/update", model: { ... } }
     * @param {String} userId - Amallarni bajargan foydalanuvchi IDsi
     */
    async create(req, data, userId) {
        const { Accessory } = req.tenantModels; // ✅ Dinamik model
        const { action, model } = data;

        try {
            // --- 1. RASM TEKSHIRUVI ---
            if (model.image && typeof model.image === 'string' && model.image.startsWith('data:image')) {
                const base64Length = model.image.length;
                const sizeInMB = (base64Length * 3) / (4 * 1024 * 1024);

                if (sizeInMB > 5) {
                    return { 
                        status: "400", 
                        msg: `Rasm hajmi juda katta (${sizeInMB.toFixed(2)} MB). Limit: 5MB.` 
                    };
                }
            }

            // --- 2. YARATISH (CREATE) MANTIQI ---
            if (action === "create") {
                const materialExists = await Accessory.exists({
                    isActive: true,
                    $or: [
                        { name: { $regex: new RegExp(`^${model.name}$`, "i") } },
                        { code: model.code }
                    ]
                });

                if (materialExists) {
                    return { status: "400", msg: "Bunday xomashyo nomi yoki kodi tizimda mavjud!" };
                }

                if (model.code) {
                    model.qr = await generateQRCode(model.code);
                }

                const sanitizedData = {
                    ...model,
                    isActive: true,
                    createdBy: userId,
                    costPrice: Math.abs(Number(model.costPrice) || 0),
                    totalStock: Math.max(0, Number(model.totalStock) || 0),
                    // Turi bo'yicha maydonlarni filtrlash
                    volume: model.type === 'pkg_plastic' ? Number(model.volume) : null,
                    volumeUnit: model.type === 'pkg_plastic' ? model.volumeUnit : null,
                    fatContent: ['raw_milk', 'ingredient_liquid'].includes(model.type) ? Number(model.fatContent) : null,
                    density: ['raw_milk', 'ingredient_liquid'].includes(model.type) ? Number(model.density) : null,
                    temperature: ['raw_milk', 'ingredient_liquid'].includes(model.type) ? Number(model.temperature) : null
                };

                const saved = await AccessoryModel.create(sanitizedData);
                return { status: "200", msg: "Yangi xomashyo muvaffaqiyatli saqlandi!", data: saved };
            }

            // --- 3. TAHRIRLASH (UPDATE) MANTIQI ---
            if (action === "update") {
                const { _id, ...updateData } = model;
                if (!_id) return { status: "400", msg: "ID ko'rsatilmagan!" };

                const currentMaterial = await AccessoryModel.findById(_id);
                if (!currentMaterial) return { status: "404", msg: "Resurs topilmadi!" };

                const duplicateCheck = await AccessoryModel.exists({
                    _id: { $ne: _id },
                    isActive: true,
                    $or: [
                        { name: { $regex: new RegExp(`^${updateData.name}$`, "i") } },
                        { code: updateData.code }
                    ]
                });

                if (duplicateCheck) {
                    return { status: "400", msg: "Yangi nom yoki kod boshqa resursda band!" };
                }

                if (updateData.code && updateData.code !== currentMaterial.code) {
                    updateData.qr = await generateQRCode(updateData.code);
                }

                const updated = await AccessoryModel.findByIdAndUpdate(
                    _id, 
                    { $set: updateData }, 
                    { new: true, runValidators: true }
                );

                return { status: "200", msg: "Ma'lumotlar yangilandi!", data: updated };
            }

        } catch (error) {
            console.error("Accessory Service Error:", error);
            if (error.name === 'ValidationError') {
                return { status: "400", msg: "Validatsiya xatosi!", error: Object.values(error.errors).map(v => v.message) };
            }
            return { status: "500", msg: "Server xatosi!", error: error.message };
        }
    }

    // --- 4. LISTING METODLARI ---
    async getAll(req, filter = {}) {
        const { Accessory } = req.tenantModels;
        try {
            return await Accessory.find({ ...filter, isActive: true })
                .sort({ createdAt: -1 })
                .lean();
        } catch (error) {
            throw new Error("Ma'lumotlarni olishda xatolik: " + error.message);
        }
    }

    async getById(req, id) {
        const { AccessoryModel } = req.tenantModels;
        return await AccessoryModel.findOne({ _id: id, isActive: true }).lean();
    }

    async delete(req, id) {
        const { AccessoryModel } = req.tenantModels;
        try {
            // Soft delete tavsiya etiladi (isActive: false)
            return await AccessoryModel.findByIdAndUpdate(id, { isActive: false });
        } catch (error) {
            throw new Error("O'chirishda xatolik yuz berdi");
        }
    }
}

module.exports = new AccessoriesService();