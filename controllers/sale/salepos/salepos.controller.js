// Salepos/POS operatsiyalarini boshqarish servisini import qilish
const SaleposManagmentService = require("../../../services/sale/salepos/salepos.service.js"); 
const { sendExcelResponse } = require("../../../utils/excelHelper.js");
// Eslatma: Sizning misolingizda chaqirilgan fayl nomi 'salepos,service' emas, balki 'salepos.service' bo'lishi kerak.

class SaleposManagmentController {
    
    /**
     * Yangi Sotuvni yaratish/yakunlash (POS tranzaksiyasi)
     * Endpoint: POST /api/sale/salepos
     */
    async Create(req, res, next) {
        try {
            // Sotuvchi (Kassir) ID sini ma'lumotlarga qo'shish
            const data = await SaleposManagmentService.Create(req,{ 
                author: req.user.id, 
                payload : req.body 
            });
            res.status(200).json(data);
        } catch (error) {
            // Xatolikni keyingi middleware'ga uzatish
            next(error);
        }
    }
async GetAll(req, res, next) {
        try {
            // Query parametrlari (page, limit, filter) req.query orqali kelishi kerak
            const data = await SaleposManagmentService.GetAll(req,{payload: req.body,author : req.user.id});
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
async GetByCustomerId(req, res, next) {
        try {
            // Query parametrlari (page, limit, filter) req.query orqali kelishi kerak
            const data = await SaleposManagmentService.GetByCustomerId(req,{id:req.body.id,author : req.user.id});
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
async GetByEmployeeId(req, res, next) {
        try {
            // Query parametrlari (page, limit, filter) req.query orqali kelishi kerak
            const data = await SaleposManagmentService.GetByEmployeeId(req,{id:req.body.id,author : req.user.id});
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Sotuv/Order detallarini ID bo'yicha olish
     * Endpoint: GET /api/sale/salepos/:id
     */
    async GetSaleById(req, res, next) {
        try {
            // req.params.id da kelgan ID ni ishlatish maqsadga muvofiq
            const id = req.params.id || req.body.id; 
            const data = await SaleposManagmentService.GetSaleById(req,{ id });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Sotuv/Order holatini yangilash (Masalan, Haydovchi bog'lash)
     * Endpoint: PUT /api/sale/salepos/:id
     */
    async UpdateById(req, res, next) {
        try {
            const data = await SaleposManagmentService.UpdateSaleStatus(req,{ 
                author: req.user.id, // Yangilashni amalga oshirgan shaxs
                orderId: req.params.id, // Agar ID URL dan kelsa
                ...req.body 
            });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Barcha Sotuv Cheklarini Ro'yxatini olish
     * Endpoint: GET /api/sale/salepos/list
     */
    

    /**
     * Haydovchilar Ro'yxatini olish (Agentlar ro'yxati)
     * Endpoint: GET /api/sale/salepos/drivers
     */
    async GetAllDrivers(req, res, next) {
        try {
            const data = await SaleposManagmentService.GetAllDrivers(req,req.query);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Sotuv Chekini o'chirish
     * Endpoint: DELETE /api/sale/salepos/:id
     */
    async DeleteById(req, res, next) {
        try {
            const data = await SaleposManagmentService.DeleteSale(req,{
                id: req.params.id, // Agar ID URL dan kelsa
                author : req.user.id 
            });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Sotuv Ma'lumotlarini Excelga Export qilish
     * Endpoint: GET /api/sale/salepos/export
     */
//      async handleExcelExport(req, res) {
    
//   try {
//     // req.body - bu stordan kelayotgan buyurtmalar massivi
//     const { buffer, filename } = await SaleposManagmentService.handleExcelExport(req.body);

//     const cleanFilename = encodeURIComponent(filename);

//     // BRAUZERGA FAYL EKANINI BILDIRISH
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${cleanFilename}`);
//     res.setHeader("Content-Length", buffer.length);

//     // Bufferni to'g'ridan-to'g'ri yuboramiz
//     return res.send(buffer);
//   } catch (error) {
//     console.error("Excel Controller Error:", error.message);
//     res.status(400).json({ message: error.message });
//   }
// }

async handleExcelExport(req, res) {
    try {
        // 1. Servisdan ma'lumotni olish
        // req.body - bu frontenddan kelayotgan filterlangan ma'lumotlar
        const result = await SaleposManagmentService.handleExcelExport(req,req.body);

        // 2. Universal helper orqali javob qaytarish
        return sendExcelResponse(res, result);

    } catch (error) {
        console.error("Excel Export Error:", error.message);
        return res.status(error.status || 400).json({ 
            success: false,
            message: error.message || "Eksport jarayonida xatolik yuz berdi" 
        });
    }
}
}

module.exports = new SaleposManagmentController();