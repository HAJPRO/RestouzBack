const CounterpartyService = require("../../../services/Supply/counterparty/counterparty.service");

class CounterpartyController {
  // 📌 Kontragentni saqlash (Yaratish yoki Tahrirlash)
  async Save(req, res, next) {
    try {
      const data = await CounterpartyService.Save(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 📌 Barcha kontragentlar ro'yxati
  async GetAll(req, res, next) {
    try {
      const data = await CounterpartyService.GetAll(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 📌 ID bo'yicha o'chirish
  async DeleteById(req, res, next) {
    try {
      const data = await CounterpartyService.DeleteById(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 📌 Bitta kontragent ma'lumotlarini olish
  async GetById(req, res, next) {
    try {
      const data = await CounterpartyService.GetById(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 📌 Kontragentning sut topshirish (Kirimlar) tarixini olish
  async GetInboundsBySupplierId(req, res, next) {
    try {
      const data = await CounterpartyService.GetInboundsBySupplierId(req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // 📌 Sut topshirish hisobotini Excel formatda yuklab olish
  async ExportExcelDownload(req, res, next) {
    try {
      // Service orqali buffer va filename ni olamiz
      const { buffer, filename } = await CounterpartyService.ExportExcelDownload(req.body);

      const cleanFilename = encodeURIComponent(filename);

      // Brauzerga fayl ma'lumotlarini uzatish
      res.setHeader(
        "Content-Type", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename*=UTF-8''${cleanFilename}`
      );
      res.setHeader("Content-Length", buffer.length);

      // Excel bufferni yuborish
      return res.send(buffer);
    } catch (error) {
      console.error("Excel Controller Error:", error.message);
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new CounterpartyController();