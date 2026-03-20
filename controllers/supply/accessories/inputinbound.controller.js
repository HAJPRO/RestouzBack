const InboundService = require('../../../services/Supply/accessories/inputinbound.service');

class InboundController {
  
  /**
   * Yangi kirim yaratish
   */
  async create(req, res) {
    try {
      const result = await InboundService.createInbound(req,req.body, req.user?.id);
      
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
   * Kirimlar ro'yxatini olish (Pagination va Filtrlar bilan ishlashga mos)
   */
  async index(req, res) {
    try {
      const inbounds = await InboundService.getAllInbounds(req,req.query);
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
      const inbound = await InboundService.getAllInbounds(req,req.body,req.user.id);
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
      const inbound = await InboundService.getInboundById(req,req.params.id);
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