const BaseError = require("../../errors/base.error");

class ZoneService {
    async Create(req) {
        const { Zone } = req.tenantModels; // Model nomi Zone ga o'zgardi
        
        // 1. Body mavjudligini tekshirish
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
        }

        // 2. Ma'lumotlarni destruktizatsiya qilish
        const { action, _id, ...modelData } = req.body;

        // 3. Yaratish (Create) mantiqi
        if (action === 'create') {
            // Hudud nomi borligini tekshirish
            if (!modelData.name) {
                throw new BaseError("Hudud nomi kiritilishi shart", 400);
            }

            // Hudud nomi takrorlanmasligini tekshirish
            const exists = await Zone.findOne({ name: modelData.name });
            if (exists) {
                throw new BaseError("Bunday nomli hudud allaqachon mavjud", 400);
            }

            const data = await Zone.create(modelData);
            return {
                success: true,
                msg: "Yangi hudud muvaffaqiyatli yaratildi",
                data
            };
        } 

        // 4. Tahrirlash (Edit) mantiqi
        if (action === 'edit' || _id) {
            const zoneId = _id || modelData._id;
            
            if (!zoneId) {
                throw new BaseError("Tahrirlash uchun hudud ID si topilmadi", 400);
            }

            // _id ni modelData ichidan olib tashlaymiz
            delete modelData._id;

            const updated = await Zone.findByIdAndUpdate(
                zoneId, 
                { $set: modelData }, 
                { new: true, runValidators: true }
            );

            if (!updated) {
                throw new BaseError("Bunday ID li hudud topilmadi", 404);
            }

            return { 
                success: true,
                msg: "Hudud ma'lumotlari muvaffaqiyatli yangilandi", 
            };
        }

        // 5. Noma'lum action bo'lsa
        throw new BaseError(`Noto'g'ri operatsiya: ${JSON.stringify(action)}`, 400);
    }

    async GetAll(req) {
        const { Zone } = req.tenantModels;

        // Hududlarni saralash tartibi (order) bo'yicha olish
        const data = await Zone.find().sort({ order: 1, createdAt: -1 }).lean();

        return { 
            success: true,
            msg: "Barcha hududlar ro'yxati", 
            data 
        };
    }

    async GetById(req) {
        const { Zone } = req.tenantModels;
        
        const data = await Zone.findById(req.params.id).lean();
        
        if (!data) {
            throw new BaseError("Hudud topilmadi", 404);
        }

        return { 
            success: true,
            msg: "Hudud topildi", 
            data 
        };
    }

    async Delete(req) {
        const { Zone, Table } = req.tenantModels; // Table modelini ham tekshirish uchun olamiz
        const { id } = req.params;

        // Hududda stollar borligini tekshirish (ixtiyoriy, lekin tavsiya etiladi)
        // Agar hududda stollar bo'lsa, uni o'chirishga ruxsat bermaslik kerak
        if (Table) {
            const hasTables = await Table.findOne({ zoneId: id });
            if (hasTables) {
                throw new BaseError("Hududni o'chirib bo'lmaydi, chunki unda stollar mavjud", 400);
            }
        }

        const deleted = await Zone.findByIdAndDelete(id);

        if (!deleted) {
            throw new BaseError("O'chirilishi kerak bo'lgan hudud topilmadi", 404);
        }

        return {
            success: true,
            msg: "Hudud muvaffaqiyatli o'chirildi"
        };
    }
}

module.exports = new ZoneService();