const InboundService = require('../../../services/Supply/inbound/inbound.service');

class InboundController {
  
  /**
   * Yangi kirim yaratish
   */
  async create(req, res) {
    try {
      const result = await InboundService.createInbound(req.body, req.user?.id);
      
      res.status(201).json({
        success: true,
        msg: "Hujjat muvaffaqiyatli yaratildi",
        result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 🟢 LABORATORIYA TAHLILI VA TAQSIMOTINI SAQLASH
   * POST /api/warehouse/inbound/lab-analysis
   */
  async saveLabAnalysis(req, res) {
    try {
      // req.body ichida inboundBatchIds, labResults, distribution kabi ma'lumotlar keladi
      const result = await InboundService.saveLabAnalysis(req.body, req.user?.id);

      res.status(200).json({
        success: true,
        msg: "Laboratoriya tahlili va taqsimot muvaffaqiyatli saqlandi",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Kirimlar ro'yxatini olish (Pagination va Filtrlar bilan ishlashga mos)
   */
  async index(req, res) {
    try {
      const inbounds = await InboundService.getAllInbounds(req.query);
      res.json({
        success: true,
        data: inbounds
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Barcha kirimlarni olish (Qisqa variant)
   */
  async GetAll(req, res) {
    try {
      const inbound = await InboundService.getAllInbounds();
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

  /**
   * Batafsil ko'rish
   */
  async show(req, res) {
    try {
      const inbound = await InboundService.getInboundById(req.params.id);
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
}

module.exports = new InboundController();