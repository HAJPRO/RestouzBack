const CustomerManagmentService = require("../../../services/customers/c-managment/managment.service");

class CustomerManagmentController {
  async Create(req, res, next) {
    try {
      // ✅ req va req.body uzatildi
      const data = await CustomerManagmentService.Create(req, req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async GetAll(req, res, next) {
    try {
      // ✅ req va req.body uzatildi
      const data = await CustomerManagmentService.GetAll(req, req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async DeleteById(req, res, next) {
    try {
      // ✅ req va req.body uzatildi
      const data = await CustomerManagmentService.DeleteById(req, req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async GetById(req, res, next) {
    try {
      // ✅ req va req.body uzatildi
      const data = await CustomerManagmentService.GetById(req, req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async GetOrdersByCustomerId(req, res, next) {
    try {
      // ✅ req va req.body uzatildi
      const data = await CustomerManagmentService.GetOrdersByCustomerId(req, req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  async ExportExcelDownload(req, res) {
    try {
      // Agar Excel servisi ichida ham tenant modeller kerak bo'lsa 'req'ni uzating
      const { buffer, filename } = await CustomerManagmentService.ExportExcelDownload(req,req.body);

      const cleanFilename = encodeURIComponent(filename);

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${cleanFilename}`);
      res.setHeader("Content-Length", buffer.length);

      return res.send(buffer);
    } catch (error) {
      console.error("Excel Controller Error:", error.message);
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new CustomerManagmentController();