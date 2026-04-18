const BaseError = require("../../../errors/base.error");

class DepartmentService {
    async Create(req) {
        const { Department } = req.tenantModels;
        
        // 1. Body mavjudligini tekshirish
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
        }

        // 2. Ma'lumotlarni destruktizatsiya qilish
        // Frontend'dan 'action' obyekti ( {action: 'create/edit', id: '...'} ) keladi
        const { action,_id, ...modelData } = req.body;

        // 3. Yaratish (Create) mantiqi
        if (action === 'create') {
            // Bo'lim nomi borligini tekshirish
            if (!modelData.name) {
                throw new BaseError("Bo'lim nomi kiritilishi shart", 400);
            }

            // Bo'lim nomi takrorlanmasligini tekshirish (ixtiyoriy)
            const exists = await Department.findOne({ name: modelData.name });
            if (exists) {
                throw new BaseError("Bunday nomli bo'lim allaqachon mavjud", 400);
            }

            const data = await Department.create(modelData);
            return {
                success: true,
                msg: "Bo'lim muvaffaqiyatli yaratildi",
                data
            };
        } 

        // 4. Tahrirlash (Edit) mantiqi
        if (action === 'edit' || _id) {
            const departmentId = _id || modelData._id;
            
            if (!departmentId) {
                throw new BaseError("Tahrirlash uchun bo'lim ID si topilmadi", 400);
            }

            // _id ni modelData ichidan olib tashlaymiz (bazada o'zgarmasligi uchun)
            delete modelData._id;

            const updated = await Department.findByIdAndUpdate(
                departmentId, 
                { $set: modelData }, 
                { new: true, runValidators: true }
            );

            if (!updated) {
                throw new BaseError("Bunday ID li bo'lim topilmadi", 404);
            }

            return { 
                success: true,
                msg: "Bo'lim ma'lumotlari muvaffaqiyatli yangilandi", 
            };
        }

        // 5. Noma'lum action bo'lsa
        throw new BaseError(`Noto'g'ri operatsiya: ${JSON.stringify(action)}`, 400);
    }

    async GetAll(req) {
        const { Department } = req.tenantModels;

        // Bo'limlarni olishda ixtiyoriy ravishda xodimlar sonini ham hisoblash mantiqini qo'shish mumkin
        // Hozircha oddiy ro'yxatni qaytaramiz
        const data = await Department.find().sort({ createdAt: -1 }).lean();

        return { 
            success: true,
            msg: "Barcha bo'limlar ro'yxati", 
            data 
        };
    }

    async GetById(req) {
        const { Department } = req.tenantModels;
        
        const data = await Department.findById(req.params.id).lean();
        
        if (!data) {
            throw new BaseError("Bo'lim topilmadi", 404);
        }

        return { 
            success: true,
            msg: "Bo'lim topildi", 
            data 
        };
    }

    // Bo'limni o'chirish metodini ham qo'shib qo'yish foydali bo'ladi
    async Delete(req) {
        const { Department } = req.tenantModels;
        const { id } = req.params;

        const deleted = await Department.findByIdAndDelete(id);

        if (!deleted) {
            throw new BaseError("O'chirilishi kerak bo'lgan bo'lim topilmadi", 404);
        }

        return {
            success: true,
            msg: "Bo'lim muvaffaqiyatli o'chirildi"
        };
    }
}

module.exports = new DepartmentService();