const {PermissionService} = require("../../../services/index.service");


class PermissionController {
  async CreatePermission(req, res, next) {
    try {
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
      const data = await PermissionService.GetAll(req, req.query);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermissionController();