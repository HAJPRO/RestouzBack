const Laboratory = require("../../../models/Laboratory/laboratory.model");
const {generatePdfBuffer} = require('../../../utils/generater');
const path = require('path');
class LaboratoryAnaliticService {
  // Barcha tahlillarni olish (Filtrlar bilan)
  async GetAllAnalytics(query) {
  const data = await Laboratory.find()
      .populate("author", "fullname")
      .populate("inboundBatchIds")
      .sort({ createdAt: -1 });

    return {status : 200, data}

  }
// analitic.service.js
async downloadLaboratoryReport(payload) {
    const { id } = payload; // payload ichida id borligini tekshiring
    const laboratoryData = await Laboratory.findById(id)
        .populate("author", "fullname")
        .populate("inboundBatchIds").lean();
    // XATOLIKNI OLDINI OLISH: Agar ma'lumot topilmasa
    if (!laboratoryData) {
        throw new Error("Ma'lumot topilmadi"); 
    }
    const templatePath = path.join(__dirname, '../../../templates/laboratory/AnaliticCard.html');
    // Bu yerda generatePdfBuffer funksiyasiga 'data' obyekti sifatida uzatamiz
    const pdfBuffer = await generatePdfBuffer(templatePath, { 
        data: laboratoryData, 
        generatedAt: new Date().toLocaleString('uz-UZ')
    });
    return pdfBuffer; // Faqat bufferni qaytaramiz
}
}

module.exports = new LaboratoryAnaliticService();