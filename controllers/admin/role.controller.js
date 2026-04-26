
const {RoleService} = require("../../services/index.service");

class RoleController {
  async Create(req, res, next) {
    try {
      const data = await RoleService.Create(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await RoleService.GetAll(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
