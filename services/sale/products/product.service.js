const { ExportToExcelUniversal } = require("../../../utils/excelHelper");
const moment = require('moment-timezone');
const { generateQRCode } = require('../../../utils/generater');
const path = require('path');

class ProductManagementService {
    /**
     * Yangi mahsulot yaratish (Multi-tenant)
     */
    async create(req, data, authorId) {
        const { Product } = req.tenantModels; // ✅ Dinamik model
        try {
            // 1. Unikallikni tekshirish
            const existingProduct = await Product.findOne({ code: data.code });
            if (existingProduct) {
                return { success: false, msg: `Diqqat: ${data.code} kodli mahsulot mavjud!` };
            }

            // 2. QR Kodni generatsiya qilish
            const qrCodeBase64 = await generateQRCode(data.code);

            // 3. Rasm yo'lini to'g'rilash
            let fullImageUrl = "";
            if (data.image) {
                let cleanPath = data.image.replace(/\\/g, '/').replace(/^public\//, '').replace(/^\/+/, '');
                
                if (cleanPath.startsWith('http')) {
                    fullImageUrl = cleanPath;
                } else {
                    const baseUrl = (process.env.BASE_URL || "").replace(/\/+$/, '');
                    fullImageUrl = `${baseUrl}/${cleanPath}`;
                }
            }

            // 4. Bazaga saqlash
            const newProduct = await Product.create({
                ...data,
                author: authorId,
                image: fullImageUrl,
                qr: qrCodeBase64
            });

            return { 
                success: true, 
                msg: "Mahsulot va QR kod yaratildi!", 
                data: newProduct 
            };
        } catch (error) {
            console.error("Product Create Error:", error);
            return { success: false, msg: `Xatolik: ${error.message}` };
        }
    }

    /**
     * Mahsulotni tahrirlash
     */
    async update(req, id, updateData) {
        const { Product } = req.tenantModels;
        try {
            // 1. Xavfsizlik: o'zgarmasligi kerak bo'lgan maydonlarni tozalash
            delete updateData.totalStock;
            delete updateData.author;
            delete updateData._id;

            const product = await Product.findById(id);
            if (!product) return { success: false, msg: "Mahsulot topilmadi" };

            // 2. Kod o'zgarganda yangi QR kod yaratish
            if (updateData.code && updateData.code !== product.code) {
                const duplicate = await Product.findOne({ code: updateData.code, _id: { $ne: id } });
                if (duplicate) return { success: false, msg: "Bu shtrix-kod boshqa mahsulotda band!" };
                updateData.qr = await generateQRCode(updateData.code);
            }

            // 3. Rasm formatini to'g'rilash
            if (updateData.image && !updateData.image.startsWith('http')) {
                let cleanPath = updateData.image.replace(/\\/g, '/').replace(/^public\//, '').replace(/^\/+/, '');
                const baseUrl = (process.env.BASE_URL || "").replace(/\/+$/, '');
                updateData.image = `${baseUrl}/${cleanPath}`;
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            return { success: true, msg: "Mahsulot yangilandi!", data: updatedProduct };
        } catch (error) {
            return { success: false, msg: `Xatolik: ${error.message}` };
        }
    }

    /**
     * Barcha mahsulotlarni pagination va filter bilan olish
     */
    async getAll(req, query) {
        const { Product } = req.tenantModels;
        try {
            const page = parseInt(query.page) || 1;
            const limit = parseInt(query.limit) || 10;
            const skip = (page - 1) * limit;
            
            let filter = { state: true };

            if (query.search) {
                filter.$or = [
                    { name: { $regex: query.search, $options: "i" } },
                    { code: { $regex: query.search, $options: "i" } }
                ];
            }

            if (query.category && query.category !== "Barchasi") {
                filter.category = query.category;
            }

            // countDocuments() ishlash tezligi uchun Promise.all ishlatamiz
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
    async getOne(req, id) {
        const { Product } = req.tenantModels;
        try {
            const product = await Product.findById(id).populate('author', 'fullname').lean();
            if (!product) return { success: false, msg: "Mahsulot topilmadi" };
            return { success: true, data: product };
        } catch (error) {
            return { success: false, msg: `Xatolik: ${error.message}` };
        }
    }

    /**
     * Soft Delete (Holatni o'zgartirish)
     */
    async delete(req, id) {
        const { Product } = req.tenantModels;
        try {
            const deleted = await Product.findByIdAndUpdate(id, { state: false, status: 'inactive' });
            if (!deleted) return { success: false, msg: "Mahsulot topilmadi" };
            return { success: true, msg: "Mahsulot o'chirildi" };
        } catch (error) {
            return { success: false, msg: `Xatolik: ${error.message}` };
        }
    }

    /**
     * Excel export
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

            return await ExportToExcelUniversal(data, columns, {
                title: "Mahsulotlar ro'yxati",
                filename: `mahsulotlar_${moment().format("DD_MM_YYYY")}`,
                sheetName: "Mahsulotlar"
            });
        } catch (error) {
            throw new Error("Excel eksportda xatolik: " + error.message);
        }
    }
}

module.exports = new ProductManagementService();