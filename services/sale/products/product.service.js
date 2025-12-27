const Product = require("../../../models/Sale/products/product.model");
const { ExportToExcelUniversal } = require("../../../utils/excelHelper");
const moment = require('moment-timezone');

class ProductManagementService {

  /**
   * Yangi mahsulot yaratish
   */
 async create(data, authorId) {
  try {
    // 1. Shtrix-kod takrorlanmasligini tekshirish
    const existingProduct = await Product.findOne({ code: data.code });
    if (existingProduct) {
      return { success: false, msg: `Diqqat: ${data.code} kodli mahsulot allaqachon mavjud!` };
    }

    // 2. Rasm yo'lini to'liq URL ga aylantirish
    let fullImageUrl = "";
    if (data.image) {
      // Agar rasm yo'li allaqachon http bilan boshlansa (masalan, eski ma'lumot)
      if (data.image.startsWith('http')) {
        fullImageUrl = data.image;
      } else {
        // BASE_URL ni .env dan olamiz (https://safymilk-core.company-erp.uz)
        // data.image esa "uploads/products/product-123.jpg" ko'rinishida bo'ladi
        const baseUrl = process.env.BASE_URL.replace(/\/+$/, ''); // Oxiridagi / ni olib tashlaydi
        const imagePath = data.image.replace(/^\/+/, '');        // Boshidagi / ni olib tashlaydi
        fullImageUrl = `${baseUrl}/${imagePath}`;
      }
    }

    // 3. Yangi obyektni tayyorlash
    const newProductPayload = {
      ...data,
      author: authorId,
      image: fullImageUrl // Endi bazaga to'liq URL yoziladi
    };

    const newProduct = await Product.create(newProductPayload);
    return { success: true, msg: "Mahsulot muvaffaqiyatli qo'shildi!", data: newProduct };
  } catch (error) {
    console.error("Product Create Error:", error);
    return { success: false, msg: `Xatolik: ${error.message}` };
  }
}

  /**
   * Mahsulotni tahrirlash
   */
  async update(id, updateData) {
    try {
      // 1. Faqat xavfsizlik nuqtai nazaridan o'chirilishi kerak bo'lgan maydonlar
      // totalStock faqat ombor amaliyoti (kirim/chiqim) orqali o'zgarishi kerak
      delete updateData.totalStock; 
      delete updateData.author;
      delete updateData._id;

      // 2. Agar code o'zgarayotgan bo'lsa, unikal ekanligini tekshirish
      if (updateData.code) {
        const duplicate = await Product.findOne({ code: updateData.code, _id: { $ne: id } });
        if (duplicate) {
          return { success: false, msg: "Bu shtrix-kod boshqa mahsulotda band!" };
        }
      }

      // 3. Mahsulotni yangilash
      const updatedProduct = await Product.findByIdAndUpdate(
        id, 
        { $set: updateData }, // $set ishlatish xavfsizroq
        { new: true, runValidators: true } 
      );
      
      if (!updatedProduct) {
        return { success: false, msg: "Mahsulot topilmadi" };
      }

      return { success: true, msg: "Mahsulot muvaffaqiyatli yangilandi!", data: updatedProduct };
    } catch (error) {
      console.error("Product Update Error:", error);
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }

  /**
   * Barcha mahsulotlarni pagination va filter bilan olish
   */
  async getAll(query) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;
      
      let filter = { state: true }; // O'chirilmagan mahsulotlar

      // Qidiruv
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: "i" } },
          { code: { $regex: query.search, $options: "i" } }
        ];
      }

      // Kategoriya filtri
      if (query.category && query.category !== "Barchasi") {
        filter.category = query.category;
      }

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter)
      ]);

      return {
        success: true,
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return { success: false, msg: `Server xatosi: ${error.message}`, products: [] };
    }
  }

  /**
   * Bitta mahsulotni olish
   */
  async getOne(id) {
    try {
      const product = await Product.findById(id).populate('author', 'name').lean();
      if (!product) return { success: false, msg: "Mahsulot topilmadi" };
      return { success: true, data: product };
    } catch (error) {
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }

  /**
   * Mahsulotni o'chirish (Soft Delete tavsiya etiladi)
   */
  async delete(id) {
    try {
      // Fizik o'chirish o'rniga holatni o'zgartirish (State: false)
      const deleted = await Product.findByIdAndUpdate(id, { state: false, status: 'inactive' });
      
      if (!deleted) return { success: false, msg: "Mahsulot topilmadi" };
      return { success: true, msg: "Mahsulot o'chirildi" };
    } catch (error) {
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }

  /**
   * Excel export funksiyasi
   */
  async handleExcelExport(data) {
    try {
      const columns = [
        { header: "№", key: "index", width: 8 },
        { header: "Mahsulot nomi", key: "name", width: 35 },
        { header: "Artikul (Code)", key: "code", width: 15 },
        { header: "Kategoriya", key: "category", width: 25 },
        { header: "Tannarxi", key: "costPrice", width: 18 },
        { header: "Sotuv narxi", key: "salePrice", width: 18 },
        { header: "Ustama (%)", key: "margainPercent", width: 12 },
        { header: "Ombordagi qoldiq", key: "totalStock", width: 18 },
        { header: "O'lchov birligi", key: "unit", width: 15 },
        { header: "Holat", key: "status", width: 15 }
      ];

      const result = await ExportToExcelUniversal(data, columns, {
        title: "Mahsulotlar ro'yxati",
        filename: `mahsulotlar_${moment().format("DD_MM_YYYY")}`,
        sheetName: "Mahsulotlar"
      });

      return result;
    } catch (error) {
      throw new Error("Excel eksportda xatolik: " + error.message);
    }
  }
}

module.exports = new ProductManagementService();