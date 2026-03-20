const WarehouseInputService = require("../../../services/warehouses/input/input.service.js");

class WarehouseInputController {

  /**
   * Partiya model shablonini olish (GET)
   * GET /api/warehouses/r-warehouse/model
   */
  async getModel(req, res, next) {
    try {
      const result = await WarehouseInputService.getModel(req);
      
      if (!result.success) {
          return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Yangi partiya kirim qilish (Create Batch) (POST)
   * Bu endpoint Frontenddagi Kirim Hujjati (EcoInbound) ning har bir qatori uchun chaqiriladi.
   * POST /api/warehouses/r-warehouse/
   */
  async create(req, res, next) {
    try {
      // ⚠️ DİQQAT: Frontend endi faqat to'liq payload yuboradi, action va modelni ajratish shart emas.
      // Lekin oldingi service modeliga moslash uchun req.body.action ishlatiladi.
      const payload = { 
          ...req.body, // Bu yerda product, costPrice, initialQuantity kabi ma'lumotlar bor
          author: req.user.id,
          // Agar Front-end action va payloadni alohida yuborsa:
          // ...req.body.model, author: req.user.id
      };
      
      // Front-end'dan 'action' kelsa, uni olamiz (masalan, 'create'). Aks holda 'create' default
      const action = req.body.action || 'create';

      const result = await WarehouseInputService.create(req,payload, action);
      
      if (!result.success) {
          return res.status(result.status || 400).json(result);
      }
      res.status(result.status || 201).json(result); // 201 Created
    } catch (error) {
      next(error);
    }
  }

  /**
   * Barcha aktiv partiyalarni olish (Pagination & Filter) (GET)
   * GET /api/warehouses/r-warehouse/?page=1&search=...
   */
  async getAll(req, res, next) {
    try {
      // GET so'rovlari uchun parametrlar req.query dan olinadi
      const query = { ...req.body, author: req.user.id };
      const result = await WarehouseInputService.getAll(req,query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bitta partiyani ID orqali olish (GET)
   * GET /api/warehouses/r-warehouse/:id
   */
  async getOne(req, res, next) {
    try {
      // ID ni URL parametrlaridan olamiz
      const { id } = req.params;
      const result = await WarehouseInputService.getOne(req,id);
      
      if (!result.success) {
          return res.status(404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mahsulot chiqarish (Sotish, Chiqim) (POST)
   * POST /api/warehouses/r-warehouse/output
   */
  async outputProduct(req, res, next) {
    try {
      // Data: { partyId: ..., output: [...] }
      const data = { ...req.body, author: req.user.id };
      const result = await WarehouseInputService.outputProduct(req,data);
      
      if (!result.success) {
          return res.status(result.status || 400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Partiyani yoki ichki elementni o'chirish (DELETE)
   * DELETE /api/warehouses/r-warehouse/:id?action=4
   */
  async deleteById(req, res, next) {
    try {
      // ID ni URL params dan olamiz, action ni Query dan olamiz
      const { id } = req.params;
      const { action } = req.query; // 4 - butun partiyani o'chirish
      
      const result = await WarehouseInputService.deleteById(req,id, parseInt(action) || 4);
      
      if (!result.success) {
          return res.status(result.status || 404).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
async clearAllData(req, res, next) {
    try {
      const result = await WarehouseInputService.clearAllData(req);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
} 
}

module.exports = new WarehouseInputController();