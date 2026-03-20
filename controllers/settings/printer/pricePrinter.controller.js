const TemplateService = require('../../../services/settings/printer/pricePrinter.service');

class PricePrinterTemplateController {
  /**
   * Barcha shablonlarni olish
   */
  async GetAll(req, res) {
    try {
      const result = await TemplateService.GetAllTemplates(req,req.query);
      res.status(result.status).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Yangi shablon yaratish
   */
  async Create(req, res) {
    try {
      const result = await TemplateService.CreateTemplate(req,req.body);
      res.status(result.status).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Shablonni tahrirlash
   */
  async Update(req, res) {
    try {
      const result = await TemplateService.UpdateTemplate(req,req.params.id, req.body);
      res.status(result.status).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Shablonni o'chirish
   */
  async Delete(req, res) {
    try {
      const result = await TemplateService.DeleteTemplate(req,req.params.id);
      res.status(result.status || 200).json({
        success: true,
        message: "Shablon muvaffaqiyatli o'chirildi"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
//printer conf
async GetAllPrinter(req, res) {
    try {
      const result = await TemplateService.GetAllPrinter(req,req.query);
      res.json({
        success: true,
        data: result.printersList
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async sendToPrintBulk(req, res) {
    try {
      const result = await TemplateService.sendToPrintBulk(req,req.body);
      res.json(result);
    } catch (error) {
      res.json({
        success: false,
        // message: error.message
      });
    }
  }
  
}

module.exports = new PricePrinterTemplateController();