const InboundService = require('../../../services/Supply/inbound/inbound.service');

class InboundController {
 
  async create(req, res) {
    try {
      // req.user.id - bu auth middleware'dan kelayotgan foydalanuvchi IDsi
      const result = await InboundService.createInbound(req.body, req.user?.id);
      
      res.status(201).json({
        success: true,
        msg: "Laboratoriya qabuli muvaffaqiyatli yakunlandi",
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
   * Kirimlar ro'yxati
   * GET /api/warehouse/inbound
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
   * Batafsil ko'rish
   * GET /api/warehouse/inbound/:id
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