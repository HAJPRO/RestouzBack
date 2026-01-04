const LaboratoryAnaliticService = require('../../../services/Laboratory/analitic/analitic.service');
const { sendPdfResponse } = require('../../../utils/generater');

class LaboratoryAnaliticController {
  /**
   * Barcha kirimlarni olish (Qisqa variant)
   */
  async GetAll(req, res) {
    try {
      const inbound = await LaboratoryAnaliticService.GetAllAnalytics(req.body);
      res.json({
        success: true,
        data: inbound
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
 // analitic.controller.js
async GeneratePdf(req, res) {
    try {
        const pdfBuffer = await LaboratoryAnaliticService.downloadLaboratoryReport(req.body);
        
        // Universal helperdan foydalanamiz
        const fileName = `Analiz_Report_${req.body.id || Date.now()}`;
        return sendPdfResponse(res, pdfBuffer, fileName);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Fayl yaratishda xatolik yuz berdi" 
        });
    }
}
 
}

module.exports = new LaboratoryAnaliticController();