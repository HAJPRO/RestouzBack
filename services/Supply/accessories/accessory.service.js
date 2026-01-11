const AccessoryModel = require('../../../models/Supply/accessories/accessory.model');
const { generateQRCode } = require('../../../utils/generater');

class AccessoriesService {
    /**
     * Yaratish va Tahrirlash mantiqi
     * @param {Object} data - { action: "create/update", model: { ... } }
     * @param {String} userId - Amallarni bajargan foydalanuvchi IDsi
     */
async create(data, userId) {
    const { action, model } = data;
    try {
        // --- 1. RASM HAJMINI VA FORMATINI TEKSHIRISH ---
        if (model.image && typeof model.image === 'string' && model.image.startsWith('data:image')) {
            // Base64 dan taxminiy hajmni (byte) hisoblash
            const base64Length = model.image.length;
            const sizeInBytes = (base64Length * 3) / 4;
            const sizeInMB = sizeInBytes / (1024 * 1024);

            // 5MB limit (Baza xavfsizligi va tezligi uchun)
            if (sizeInMB > 5) {
                return { 
                    status: "400", 
                    msg: `Rasm hajmi juda katta (${sizeInMB.toFixed(2)} MB). Iltimos, 5MB dan kichik rasm yuklang.` 
                };
            }
        }

        // --- 2. YARATISH (CREATE) MANTIQI ---
        if (action === "create") {
            // Dublikat tekshiruvi: Nomi yoki Kodi bo'yicha
            const materialExists = await AccessoryModel.exists({
                isActive: true,
                $or: [
                    { name: { $regex: new RegExp(`^${model.name}$`, "i") } }, // Registrga qaramasdan tekshirish
                    { code: model.code }
                ]
            });

            if (materialExists) {
                return { status: "400", msg: "Bunday xomashyo nomi yoki kodi tizimda allaqachon mavjud!" };
            }

            // QR kod yaratish
            if (model.code) {
                model.qr = await generateQRCode(model.code);
            }

            // Ma'lumotlarni sanitizatsiya qilish (tozalash)
            const sanitizedData = {
                ...model,
                isActive: true,
                createdBy: userId,
                image: model.image || null,
                costPrice: Math.abs(Number(model.costPrice) || 0),
                totalStock: Math.max(0, Number(model.totalStock) || 0),
                
                // Turi bo'yicha texnik maydonlarni ajratish
                volume: model.type === 'pkg_plastic' ? Number(model.volume) : null,
                volumeUnit: model.type === 'pkg_plastic' ? model.volumeUnit : null,
                fatContent: ['raw_milk', 'ingredient_liquid'].includes(model.type) ? Number(model.fatContent) : null,
                density: ['raw_milk', 'ingredient_liquid'].includes(model.type) ? Number(model.density) : null,
                temperature: ['raw_milk', 'ingredient_liquid'].includes(model.type) ? Number(model.temperature) : null
            };

            const newMaterial = new AccessoryModel(sanitizedData);
            const saved = await newMaterial.save();
            
            return { status: "200", msg: "Yangi xomashyo muvaffaqiyatli saqlandi!", data: saved };
        }

        // --- 3. TAHRIRLASH (UPDATE) MANTIQI ---
        if (action === "update") {
            const { _id, ...updateData } = model;

            if (!_id) return { status: "400", msg: "ID ko'rsatilmagan!" };

            const currentMaterial = await AccessoryModel.findById(_id);
            if (!currentMaterial) {
                return { status: "404", msg: "Tahrirlanayotgan resurs topilmadi!" };
            }

            // Tahrirlashda dublikat tekshiruvi (o'zidan tashqari boshqa resurslar bilan)
            const duplicateCheck = await AccessoryModel.exists({
                _id: { $ne: _id },
                isActive: true,
                $or: [
                    { name: { $regex: new RegExp(`^${updateData.name}$`, "i") } },
                    { code: updateData.code }
                ]
            });

            if (duplicateCheck) {
                return { status: "400", msg: "Yangi nom yoki kod boshqa resursda ishlatilmoqda!" };
            }

            // QR kodni yangilash (kod o'zgargan bo'lsa)
            if (updateData.code && updateData.code !== currentMaterial.code) {
                updateData.qr = await generateQRCode(updateData.code);
            }

            // Agar yangi rasm kelmasa, eskisini saqlab qolamiz
            if (!updateData.image) {
                delete updateData.image; 
            }

            // Sonli qiymatlarni tahrirlash paytida ham tozalash
            if (updateData.costPrice !== undefined) updateData.costPrice = Math.abs(Number(updateData.costPrice));
            if (updateData.totalStock !== undefined) updateData.totalStock = Math.max(0, Number(updateData.totalStock));

            const updated = await AccessoryModel.findByIdAndUpdate(
                _id, 
                { $set: updateData }, 
                { new: true, runValidators: true }
            );

            return { status: "200", msg: "Ma'lumotlar yangilandi!", data: updated };
        }

    } catch (error) {
        console.error("AccessoryModel Service Error:", error);

        // Mongoose validation xatolarini tutish
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return { status: "400", msg: "Validatsiya xatosi!", error: messages };
        }

        // Boshqa kutilmagan xatolar
        return { 
            status: "500", 
            msg: "Serverda kutilmagan xatolik yuz berdi!", 
            error: error.message 
        };
    }
}

    // 3. Hammasini olish
    async getAll(filter = {}) {
        try {
            return await AccessoryModel.find({ ...filter, isActive: true })
                .sort({ createdAt: -1 })
                .lean();
        } catch (error) {
            throw new Error("Ma'lumotlarni olishda xatolik: " + error.message);
        }
    }

    // 4. Bitta ID bo'yicha olish
    async getById(id) {
        return await AccessoryModel.findOne({ _id: id, isActive: true }).lean();
    }

    // 5. Arxivlash (Soft Delete)
    async delete(id) {
        try {
            return await AccessoryModel.findByIdAndDelete(
                id
            );
        } catch (error) {
            throw new Error("O'chirishda xatolik yuz berdi");
        }
    }
}

module.exports = new AccessoriesService();