const {DepartmentService} = require("../../../services/index.service");


class DepartmentController {
  async Create(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const result = await DepartmentService.Create(req);

      // Frontend-ga javob qaytarish
      // result ichida success va msg service-dan keladi
      return res.status(201).json({
        success: true,
        message: result.msg || "Bo'lim muvaffaqiyatli saqlandi",
        data: result.data, 
      });
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }

  async GetAll(req, res, next) {
    try {
      // Service-dan barcha bo'limlarni olamiz
      const result = await DepartmentService.GetAll(req);

      return res.status(200).json({
        success: true,
        message: result.msg || "Barcha bo'limlar olindi",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async GetById(req, res, next) {
    try {
      const result = await DepartmentService.GetById(req);

      return res.status(200).json({
        success: true,
        message: result.msg,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  async Delete(req, res, next) {
    try {
      const result = await DepartmentService.Delete(req);

      return res.status(200).json({
        success: true,
        message: result.msg,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartmentController();