const {PermissionService} = require("../../services/index.service");

class PermissionController {
  /**
   * Yangi ruxsatnoma yaratish
   */
  async CreatePermission(req, res, next) {
    try {
      // req obyekti orqali tenantModels'ni servisga uzatamiz
      const data = await PermissionService.CreatePermission(req, req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Barcha ruxsatnomalarni olish
   */
  async GetAll(req, res, next) {
    try {
      // Filtr parametrlarini query'dan olish afzalroq (GET so'rovi uchun)
      const data = await PermissionService.GetAll(req, req.query);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermissionController();