const {MenuService} = require("../../services/index.service");


class MenuController {
  async Create(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const data = await MenuService.Create(req);

      // Frontend-ga javob qaytarish
      return res.status(201).json({
        success: true,
        message: "Muvaffaqiyatli yaratildi",
        data: data, // Yangi yaratilgan obyekt
      });
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const data = await MenuService.GetAll(req);

      // Frontend-ga javob qaytarish
      return res.status(201).json({
        success: true,
        message: "BARCHA MENULAR OLINDI",
        data, // Yangi yaratilgan obyekt
      });
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }
  async GetById(req, res, next) {
    try {
      const data = await MenuService.GetById(req);
      return res.status(200).json({
        success: true,
        message: "Menu topildi",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async CreateCategory(req, res, next) {
    try {
      const data = await MenuService.CreateCategory(req);
      return res.status(201).json({
        success: true,
        message: "Kategoriya yaratildi",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async GetAllCategories(req, res, next) {
    try {
      const data = await MenuService.GetAllCategories(req);
      return res.status(200).json({
        success: true,
        message: "Barcha kategoriyalar olindi",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  ///Cart
  async CreateOrder(req, res, next) {
    try {
      const data = await MenuService.CreateOrder(req);
      // Frontend-ga javob qaytarish
      return res.status(201).json({
        success: true,
        message: "Muvaffaqiyatli yaratildi",
        data: data, // Yangi yaratilgan obyekt
      });
    } catch (error) {
      next(error);
    }
  }
  async UpdateOrder(req, res, next) {
    try {
      const data = await MenuService.UpdateOrder(req);
      // Frontend-ga javob qaytarish
      return res.status(201).json({
        success: true,
        message: "Muvaffaqiyatli yangilandi",
        data, // Yangi yaratilgan obyekt
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
