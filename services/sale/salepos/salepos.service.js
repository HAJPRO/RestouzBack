const mongoose = require("mongoose");
const BotDriverService = require("../../../bots/drivers/services/driver.service");
const { ExportToExcelUniversal } = require("../../../utils/excelHelper");
const moment = require('moment-timezone');

class SaleposManagmentService {
    // 📌 Yangi sotuv yaratish (FIFO mantiqi bilan)
    async Create(req, data) {
        console.log(data);
        const { SaleHistory, ReadyWarehouse, Product } = req.tenantModels;
        const orderNumber = `S-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Tranzaksiya boshlash tavsiya etiladi (agar MongoDB Replica Set bo'lsa)
        try {
            const { payload, author } = data;
            const now = new Date();
            let totalSaleAmount = 0;
            const soldItemsReport = [];

            for (const item of payload.items) {
                const productId = item.product || item.productId;
                let quantityToDeduct = Number(item.quantity);

                // 1. FIFO: Eng eski partiyalarni birinchi olamiz
                const batches = await ReadyWarehouse.find({
                    product: productId,
                    currentQuantity: { $gt: 0 },
                    status: 'active'
                }).sort({ createdAt: 1 });
console.log(batches);

                // 2. Partiyalardan miqdorni ayirish
                for (const batch of batches) {
                    if (quantityToDeduct <= 0) break;

                    const amountFromThisBatch = Math.min(batch.currentQuantity, quantityToDeduct);
                    batch.currentQuantity -= amountFromThisBatch;

                    if (batch.currentQuantity === 0) {
                        batch.status = 'sold_out';
                    }
                    await batch.save();

                    soldItemsReport.push({
                        product: productId,
                        quantity: amountFromThisBatch,
                        salePrice: item.salePrice,
                        costPrice: batch.costPrice, 
                        partyNumber: batch.partyNumber,
                        name: batch.name
                    });
                    quantityToDeduct -= amountFromThisBatch;
                }

                // Miqdor yetarli emasligini tekshirish
                if (quantityToDeduct > 0) {
                    throw new Error(`Omborda yetarli mahsulot yo'q. Yana ${quantityToDeduct} ta yetishmayapti.`);
                }

                // 3. Umumiy stokni yangilash
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalStock: -Number(item.quantity) }
                });

                totalSaleAmount += Number(item.quantity) * Number(item.salePrice);
            }

            // 4. Sotuvni saqlash
            const sale = await SaleHistory.create({
                orderNumber: orderNumber,
                items: soldItemsReport,
                totalAmount: totalSaleAmount,
                branchId: payload.branchId,
                paymentType: payload.paymentType,
                mixedDetails: payload.mixedDetails,
                customerId: payload.customerId || null,
                driverId: payload.driverId || null,
                author: author,
                date: now,
            });
console.log(sale);

            // Bot orqali haydovchiga xabar
            if (sale) {
                await BotDriverService.SentOrder(sale);
                return { success: true, status: 201, msg: "Sotuv yakunlandi!", data: sale };
            }

            return { success: false, status: 400, msg: "Sotuvda xatolik" };
        } catch (error) {
            console.error("Sale Create Error:", error);
            return { success: false, status: 400, msg: error.message };
        }
    }

    // 📌 Barcha sotuvlarni olish (Pagination & Filters)
    async GetAll(req, query) {
        const { SaleHistory } = req.tenantModels;
        try {
            const { page = 1, limit = 20, startDate, endDate, branchId, driverId } = query;
            const filter = {};
            if (branchId) filter.branchId = branchId;
            if (driverId) filter.driverId = driverId;

            if (startDate || endDate) {
                filter.date = {};
                if (startDate) filter.date.$gte = new Date(startDate);
                if (endDate) filter.date.$lte = new Date(endDate);
            }

            const [sales, count] = await Promise.all([
                SaleHistory.find(filter)
                    .populate("customerId", "fullname phoneNumber address")
                    .populate("driverId", "fullname phoneNumber role")
                    .populate("author", "fullname phoneNumber")
                    .sort({ date: -1 })
                    .skip((page - 1) * limit)
                    .limit(Number(limit))
                    .lean(),
                SaleHistory.countDocuments(filter)
            ]);

            return {
                success: true,
                status: 200,
                data: sales,
                pagination: {
                    totalSales: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: Number(page)
                }
            };
        } catch (error) {
            return { success: false, status: 500, msg: "Yuklashda xatolik" };
        }
    }

    // 📌 Mijoz xaridlar tarixi
    async GetByCustomerId(req, payload) {
        const { SaleModel } = req.tenantModels;
        const { id, page = 1, limit = 10, startDate, endDate } = payload;
        try {
            const filter = { customerId: id };
            if (startDate || endDate) {
                filter.date = {};
                if (startDate) filter.date.$gte = new Date(startDate);
                if (endDate) filter.date.$lte = new Date(endDate);
            }

            const [sales, count] = await Promise.all([
                SaleModel.find(filter)
                    .populate("customerId", "fullname phoneNumber address")
                    .populate("driverId", "fullname phoneNumber role")
                    .populate("author", "fullname phoneNumber")
                    .sort({ date: -1 })
                    .skip((page - 1) * limit)
                    .limit(Number(limit))
                    .lean(),
                SaleModel.countDocuments(filter)
            ]);

            return {
                success: true,
                status: 200,
                data: { orders: sales, pagination: { totalSales: count, totalPages: Math.ceil(count / limit), currentPage: Number(page) } }
            };
        } catch (error) {
            return { success: false, status: 500, msg: error.message };
        }
    }

    // 📌 Haydovchi/Xodim sotuvlari
    async GetByEmployeeId(req, payload) {
        const { SaleModel } = req.tenantModels;
        const { id, page = 1, limit = 10 } = payload;
        try {
            const filter = { driverId: id };
            const [sales, count] = await Promise.all([
                SaleModel.find(filter)
                    .populate("customerId", "fullname phoneNumber address")
                    .populate("driverId", "fullname phoneNumber role")
                    .populate("author", "fullname phoneNumber")
                    .sort({ date: -1 })
                    .skip((page - 1) * limit)
                    .limit(Number(limit))
                    .lean(),
                SaleModel.countDocuments(filter)
            ]);

            return {
                success: true,
                status: 200,
                data: { orders: sales, pagination: { totalSales: count, totalPages: Math.ceil(count / limit), currentPage: Number(page) } }
            };
        } catch (error) {
            return { success: false, status: 500, msg: error.message };
        }
    }

    // 📌 Excel Export
    async handleExcelExport(data) {
        try {
            const columns = [
                { header: "№", key: "index", width: 8 },
                { header: "Buyurtma nomer", key: "orderNumber", width: 22 },
                { header: "Mijoz", key: "customerId.fullname", width: 35 },
                { header: "Sotuvchi", key: "author.fullname", width: 25 },
                { header: "Haydovchi", key: "driverId.fullname", width: 25 },
                { header: "Vaqt", key: "date", width: 18, type: 'date' },
                { header: "To'lov turi", key: "paymentType", width: 15 },
                { header: "Umumiy Summa", key: "totalAmount", width: 20, type: 'currency' },
                { header: "Holat", key: "status", width: 18 }
            ];
            
            return await ExportToExcelUniversal(data, columns, {
                title: "SOTUVLAR HISOBOTI",
                filename: `Sotuvlar_Hisoboti_${moment().format("DD_MM_YYYY")}`,
                sheetName: "Sotuvlar"
            });
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new SaleposManagmentService();