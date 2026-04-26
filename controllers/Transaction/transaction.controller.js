const {TransactionService} = require("../../services/index.service");


class TransactionController {
  // Yangi tranzaksiya yaratish (To'lov, qarz va h.k.)
  async Create(req, res, next) {
    try {
      const result = await TransactionService.Create(req);

      return res.status(201).json({
        success: true,
        message: result.msg || "Tranzaksiya muvaffaqiyatli saqlandi",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  // Barcha tranzaksiyalar tarixini olish (Filtrlar bilan)
  async GetAll(req, res, next) {
    try {
      const result = await TransactionService.GetAll(req);

      return res.status(200).json({
        success: true,
        message: result.msg || "Tranzaksiyalar ro'yxati olindi",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  // Bitta tranzaksiya tafsilotini olish
  async GetById(req, res, next) {
    try {
      const result = await TransactionService.GetById(req);

      return res.status(200).json({
        success: true,
        message: result.msg || "Tranzaksiya topildi",
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  // Tranzaksiyani bekor qilish (Delete operatsiyasi)
  async Delete(req, res, next) {
    try {
      const result = await TransactionService.Delete(req);

      return res.status(200).json({
        success: true,
        message: result.msg || "Tranzaksiya muvaffaqiyatli o'chirildi",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();