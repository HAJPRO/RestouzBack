const {ZoneService} = require("../../services/index.service");


class ZoneController {
  /**
   * Hudud yaratish va tahrirlash
   */
  async Create(req, res, next) {
    try {
      // Service-dan qaytgan natijani olamiz
      const result = await ZoneService.Create(req);

      // 201 Created (yaratish) yoki 200 OK (tahrirlash)
      const statusCode = req.body.action === 'create' ? 201 : 200;

      return res.status(statusCode).json({
        success: true,
        message: result.msg || "Hudud muvaffaqiyatli saqlandi",
        data: result.data, 
      });
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }

  /**
   * Barcha hududlarni olish
   */
  async GetAll(req, res, next) {
    try {
      const result = await ZoneService.GetAll(req);

      return res.status(200).json({
        success: true,
        message: result.msg || "Hududlar muvaffaqiyatli yuklandi",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ID bo'yicha bitta hududni olish
   */
  async GetById(req, res, next) {
    try {
      const result = await ZoneService.GetById(req);

      return res.status(200).json({
        success: true,
        message: result.msg || "Hudud topildi",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hududni o'chirish
   */
  async Delete(req, res, next) {
    try {
      const result = await ZoneService.Delete(req);

      return res.status(200).json({
        success: true,
        message: result.msg || "Hudud muvaffaqiyatli o'chirildi",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ZoneController();