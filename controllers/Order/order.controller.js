const {OrderService} = require("../../services/index.service");


class OrderController {
  async Create(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const data = await OrderService.Create(req);

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
      const data = await OrderService.GetAll(req);

      // Frontend-ga javob qaytarish
      return res.status(201).json({
        success: true,
        message: "Barcha Buyurtmalar olindi",
        data, // Yangi yaratilgan obyekt
      });
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }
   async SubmitPayment(req, res, next) {
    try {
      // Service-dan qaytgan ma'lumotni olamiz
      const data = await OrderService.SubmitPayment(req);

      // Frontend-ga javob qaytarish
      return res.status(201).json({
        success: true,
        message: "To'lov muvaffaqiyatli",
      });
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }
  }

module.exports = new OrderController();
