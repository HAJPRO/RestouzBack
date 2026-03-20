const AccessoriesService = require('../../../services/Supply/accessories/accessory.service');
class AccessoriesController {
    /**
     * Resursni saqlash (Yaratish yoki Tahrirlash)
     * POST /api/raw-materials/save
     */
    async saveMaterial(req, res, next) {
        try {
            // Base64 formatida rasm va action/model req.body ichida keladi
            // req.user.id - foydalanuvchi identifikatori (middleware orqali keladi)
            const result = await AccessoriesService.create(req,req.body, req.user?.id);

            // Service darajasidagi mantiqiy xatoliklarni tekshirish (400, 404)
            if (result.status && result.status !== "200") {
                return res.status(Number(result.status)).json({
                    success: false,
                    message: result.msg
                });
            }

            // Muvaffaqiyatli javob
            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.msg || "Amal muvaffaqiyatli bajarildi"
            });

        } catch (error) {
            console.error("Controller Save Error:", error);
            next(error); // Markaziy error handlerga yuborish
        }
    }

    /**
     * Barcha resurslarni filtrlash bilan olish
     * POST /api/raw-materials/get-all
     */
    async getAllMaterials(req, res, next) {
        try {
            const filter = req.body.filter || {};
            const materials = await AccessoriesService.getAll(req,filter);

            return res.status(200).json({
                success: true,
                data: materials
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bitta resurs tafsilotini ID orqali olish
     * POST /api/raw-materials/get-detail
     */
    async getDetail(req, res, next) {
        try {
            const id = req.body.id || req.params.id;
            
            if (!id) {
                return res.status(400).json({ 
                    success: false, 
                    message: "ID yuborilmadi" 
                });
            }

            const material = await AccessoriesService.getById(req,id);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: "Resurs topilmadi"
                });
            }

            return res.status(200).json({
                success: true,
                data: material
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Resursni arxivlash (Soft delete)
     * POST /api/raw-materials/delete
     */
    async deleteMaterial(req, res, next) {
        try {
            const id = req.body.id;

            if (!id) {
                return res.status(400).json({ 
                    success: false, 
                    message: "ID yuborilmadi" 
                });
            }

            const result = await AccessoriesService.delete(req,id);

            if (!result) {
                return res.status(404).json({ 
                    success: false, 
                    message: "O'chirish uchun resurs topilmadi" 
                });
            }

            return res.status(200).json({
                success: true,
                message: "Resurs muvaffaqiyatli arxivlandi"
            });
        } catch (error) {
            next(error);
        }
    }
}

// Singleton obyekt sifatida eksport qilamiz
module.exports = new AccessoriesController();