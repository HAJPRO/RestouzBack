const ProductService = require("../../../services/sale/products/product.service.js");
const { sendExcelResponse } = require("../../../utils/excelHelper.js");

class ProductManagementController {
  
  /**
   * Yangi mahsulot yaratish (POST)
   */
  async create(req, res, next) {
    try {
      // req.body - bu matnli ma'lumotlar
      // req.file - bu multer orqali yuklangan rasm obyekti
      const productData = req.body;

      // Agar rasm yuklangan bo'lsa, uning yo'lini ma'lumotlarga qo'shamiz
      if (req.file) {
        productData.image = req.file.path; 
      }

      const result = await ProductService.create(req,productData, req.user.id);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mahsulotni yangilash (PUT/PATCH)
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Yangilashda ham yangi rasm yuklangan bo'lsa, yo'lini yangilaymiz
      if (req.file) {
        updateData.image = req.file.path;
      }

      const result = await ProductService.update(req,id, updateData);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Barcha mahsulotlarni olish (GET)
   */
  async getAll(req, res, next) {
    try {
      const result = await ProductService.getAll(req,req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bitta mahsulotni olish (GET)
   */
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ProductService.getOne(req,id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mahsulotni o'chirish (DELETE)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ProductService.delete(req,id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Excel Export
   */
  async handleExcelExport(req, res) {
    try {
      const result = await ProductService.handleExcelExport(req,req.body);
      return sendExcelResponse(res, result);
    } catch (error) {
      console.error("Excel Export Error:", error.message);
      return res.status(400).json({ 
        success: false,
        message: error.message || "Eksportda xatolik yuz berdi" 
      });
    }
  }
}

module.exports = new ProductManagementController();