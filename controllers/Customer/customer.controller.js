const {CustomerService} = require("../../services/index.service");

class CustomerController {
  async Create(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const data = await CustomerService.Create(req);

      // Frontend-ga javob qaytarish
      return res.status(201).json(data);
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const data = await CustomerService.GetAll(req);

      // Frontend-ga javob qaytarish
      return res.status(201).json(data);
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }
  }

module.exports = new CustomerController();
