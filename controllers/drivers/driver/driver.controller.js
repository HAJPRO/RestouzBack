const DriversManagmentService = require("../../../services/drivers/driver/driver.service");
class DriversManagmentController {
  
  async GetAll(req, res, next) {
    try {
      const data = await DriversManagmentService.GetAll(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }


 
 
}

module.exports = new DriversManagmentController();
