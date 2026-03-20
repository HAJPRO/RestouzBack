// Statik importlar olib tashlandi, ular endi req.tenantModels ichidan olinadi
const { generatePdfBuffer } = require('../../../utils/generater');
const path = require('path');

class LaboratoryAnaliticService {
    // 📌 Barcha tahlillarni olish (Multi-tenant)
    async GetAllAnalytics(req, query) {
        const { LabAnalysis } = req.tenantModels; // ✅ Dinamik model
        try {
            const data = await LabAnalysis.find()
                .populate("author", "fullname") // Xodim ma'lumotlari
                .populate({
                    path: 'inboundBatchIds',
                    populate: {
                        path: 'counterparty',
                        select: 'fullname phone' // Ta'minotchi/Mijoz ma'lumotlari
                    }
                })
                .sort({ createdAt: -1 })
                .lean(); // Tezlik uchun lean() qo'shildi
            return { status: 200, data };
        } catch (error) {
            return { status: 500, msg: `Laboratoriya ma'lumotlarini yuklashda xatolik: ${error.message}` };
        }
    }

    // 📌 Laboratoriya hisobotini PDF ko'rinishida yuklab olish
    async downloadLaboratoryReport(req, payload) {
        const { LabAnalysis } = req.tenantModels; // ✅ Dinamik model
        const { id } = payload;
        try {
            const laboratoryData = await LabAnalysis.findById(id)
                .populate("author", "fullname")
                .populate({
                    path: 'inboundBatchIds',
                    populate: {
                        path: 'counterparty',
                        select: 'fullname phone'
                    }
                })
                .lean();
console.log(laboratoryData)
            if (!laboratoryData) {
                throw new Error("Laboratoriya tahlili topilmadi");
            }

            // PDF shabloni manzili
            const templatePath = path.join(__dirname, '../../../templates/laboratory/AnaliticCard.html');

            // 📄 PDF generatsiya qilish
            const pdfBuffer = await generatePdfBuffer(templatePath, {
                data: laboratoryData,
                // Tenant haqida ma'lumotni shablonda ko'rsatish uchun uzatish mumkin
                // companyName: req.tenantId.toUpperCase(), 
                generatedAt: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
            });

            return pdfBuffer;
        } catch (error) {
            console.error("PDF Export error:", error);
            throw new Error(`PDF tayyorlashda xatolik yuz berdi: ${error.message}`);
        }
    }
}

module.exports = new LaboratoryAnaliticService();