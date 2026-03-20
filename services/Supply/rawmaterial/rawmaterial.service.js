const { generateQRCode } = require('../../../utils/generater');

class RawMaterialService {
    /**
     * Yaratish va Tahrirlash mantiqi (Tenant-aware)
     * @param {Object} req - Tenant modellari va user ma'lumotlari uchun
     * @param {Object} data - { action: "create/update", model: { ... } }
     */
    async create(req, data) {
        const { RawMaterial } = req.tenantModels;
        const userId = req.user?._id;
        const { action, model } = data;

        try {
            // --- 1. RASM HAJMINI TEKSHIRISH ---
            if (model.image?.startsWith('data:image')) {
                const sizeInMB = (model.image.length * 3) / (4 * 1024 * 1024);
                if (sizeInMB > 5) {
                    return { status: "400", msg: `Rasm hajmi juda katta (${sizeInMB.toFixed(2)} MB).` };
                }
            }

            // --- 2. YARATISH (CREATE) MANTIQI ---
            if (action === "create") {
                const materialExists = await RawMaterial.exists({
                    isActive: true,
                    $or: [
                        { name: { $regex: new RegExp(`^${model.name}$`, "i") } },
                        { code: model.code }
                    ]
                });

                if (materialExists) {
                    return { status: "400", msg: "Bunday xomashyo nomi yoki kodi allaqachon mavjud!" };
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
                    // Turi bo'yicha texnik maydonlarni filtrlash
                    ...this._filterTechnicalFields(model)
                };

                const saved = await RawMaterial.create(sanitizedData);
                return { status: "200", msg: "Xomashyo muvaffaqiyatli saqlandi!", data: saved };
            }

            // --- 3. TAHRIRLASH (UPDATE) MANTIQI ---
            if (action === "update") {
                const { _id, ...updateData } = model;
                if (!_id) return { status: "400", msg: "ID ko'rsatilmagan!" };

                const currentMaterial = await RawMaterial.findById(_id);
                if (!currentMaterial) return { status: "404", msg: "Resurs topilmadi!" };

                const duplicateCheck = await RawMaterial.exists({
                    _id: { $ne: _id },
                    isActive: true,
                    $or: [
                        { name: { $regex: new RegExp(`^${updateData.name}$`, "i") } },
                        { code: updateData.code }
                    ]
                });

                if (duplicateCheck) return { status: "400", msg: "Nomi yoki kodi boshqa resursda band!" };

                if (updateData.code && updateData.code !== currentMaterial.code) {
                    updateData.qr = await generateQRCode(updateData.code);
                }

                // Sonli qiymatlarni tozalash
                if (updateData.costPrice !== undefined) updateData.costPrice = Math.abs(Number(updateData.costPrice));
                if (updateData.totalStock !== undefined) updateData.totalStock = Math.max(0, Number(updateData.totalStock));

                const updated = await RawMaterial.findByIdAndUpdate(
                    _id, 
                    { $set: { ...updateData, ...this._filterTechnicalFields(updateData) } }, 
                    { new: true, runValidators: true }
                );

                return { status: "200", msg: "Ma'lumotlar yangilandi!", data: updated };
            }

        } catch (error) {
            console.error("RawMaterial Service Error:", error);
            return { status: "500", msg: "Serverda xatolik!", error: error.message };
        }
    }

    /**
     * Xomashyo turi bo'yicha texnik maydonlarni ajratish (Helper)
     */
    _filterTechnicalFields(model) {
        const isLiquid = ['raw_milk', 'ingredient_liquid'].includes(model.type);
        const isPlastic = model.type === 'pkg_plastic';

        return {
            volume: isPlastic ? Number(model.volume) : null,
            volumeUnit: isPlastic ? model.volumeUnit : null,
            fatContent: isLiquid ? Number(model.fatContent) : null,
            density: isLiquid ? Number(model.density) : null,
            temperature: isLiquid ? Number(model.temperature) : null
        };
    }

    // --- 4. LISTING VA DELETE ---
    async getAll(req, filter = {}) {
        const { RawMaterial } = req.tenantModels;
        return await RawMaterial.find({ ...filter, isActive: true }).sort({ createdAt: -1 }).lean();
    }

    async getById(req, id) {
        const { RawMaterial } = req.tenantModels;
        return await RawMaterial.findOne({ _id: id, isActive: true }).lean();
    }

    async delete(req, id) {
        const { RawMaterial } = req.tenantModels;
        return await RawMaterial.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }
}

module.exports = new RawMaterialService();