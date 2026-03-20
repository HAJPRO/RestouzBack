const OrderManagmentService = require("../../../services/sale/orders/order.service");
class OrderManagmentController {
  async Create(req, res, next) {
    try {
      const data = await OrderManagmentService.Create(req,{ author: req.user.id, ...req.body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async OrderGetById(req, res, next) {
    try {
      const data = await OrderManagmentService.OrderGetById(req,{ author: req.user.id, ...req.body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async UpdateById(req, res, next) {
    try {
      const data = await OrderManagmentService.UpdateById(req,{ author: req.user.id, ...req.body });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAll(req, res, next) {
    try {
      const data = await OrderManagmentService.GetAll(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetAllDrivers(req, res, next) {
    try {
      const data = await OrderManagmentService.GetAllDrivers(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async DeleteById(req, res, next) {
    try {
      const data = await OrderManagmentService.DeleteById(req,{...req.body, author : req.user.id});
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }

  }
  async ExportExcelDownload(req, res, next) {
    try {
      const data = await OrderManagmentService.ExportExcelDownload(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }

  }



}

module.exports = new OrderManagmentController();
