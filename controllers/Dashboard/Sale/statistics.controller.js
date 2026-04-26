const { StatisticsService } = require("../../../services/index.service");

class StatisticsController {
  /**
   * Dashboard uchun asosiy statistika
   * (Grafik, jami tushum, o'rtacha chek va to'lov turlari tahlili)
   */
  async GetDashboardStats(req, res, next) {
    try {
      // Service-dan barcha dashboard metrikalarini olamiz
      const data = await StatisticsService.GetDashboardStats(req);

      // Muvaffaqiyatli javob qaytarish
      return res.status(200).json(data);
    } catch (error) {
      // Xatolikni errorMiddleware-ga uzatish
      next(error);
    }
  }

  /**
   * Top sotilayotgan mahsulotlar ro'yxati
   */
  async GetTopSales(req, res, next) {
    try {
      const data = await StatisticsService.GetTopSales(req);

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eng ko'p xarid qilgan top mijozlar ro'yxati
   */
  async GetTopCustomers(req, res, next) {
    try {
      // Service-dan top mijozlar ma'lumotlarini olamiz
      const data = await StatisticsService.GetTopCustomers(req);

      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StatisticsController();