const {FeeService} = require("../../../services/index.service");

class FeeController {
  async Create(req, res, next) {
    try {
      const data = await FeeService.Create(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetFee(req, res, next) {
    try {
      const data = await FeeService.GetFee(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeeController();
