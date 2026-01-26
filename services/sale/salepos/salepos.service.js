const mongoose = require("mongoose");
const SaleModel = require("../../../models/Sale/orders/sales.model"); 
const ReadyWarehouse = require("../../../models/warehouses/r-warehouse/Rwarehouse.model");
const Product = require("../../../models/Sale/products/product.model"); 
const UserModel = require("../../../models/user.model"); 
const {ExportToExcelUniversal} = require("../../../utils/excelHelper")
const BotDriverService = require("../../../bots/drivers/services/driver.service");
const moment = require('moment-timezone');

// const { generateUniqueOrderNumber } = require("../../../utils/generateUniqueNumber"); 
class SaleposManagmentService {
async Create(data) {
    const orderNumber = `S-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  try {
    const {payload,author} = data
    
    const now = new Date();
    let totalSaleAmount = 0;
    const soldItemsReport = [];

    for (const item of payload.items) {
      const productId = item.product || item.productId;
      let quantityToDeduct = Number(item.quantity); // Sotilishi kerak bo'lgan jami miqdor

      // 1. Shu mahsulotning barcha faol partiyalarini eskidan yangiga qarab olamiz
      const batches = await ReadyWarehouse.find({
        product: productId,
        // branchId: payload.branchId,
        currentQuantity: { $gt: 0 },
        status: 'active'
      }).sort({ createdAt: 1 });

      // 2. Partiyalarni ketma-ketlikda tekshirish
      for (const batch of batches) {
        if (quantityToDeduct <= 0) break; // Agar kerakli miqdor yig'ib bo'lingan bo'lsa, to'xtaymiz

        // Ushbu partiyada bor miqdor va bizga kerakli miqdorning kichigini olamiz
        const amountFromThisBatch = Math.min(batch.currentQuantity, quantityToDeduct);

        // Partiyadagi qoldiqni ayiramiz
        batch.currentQuantity -= amountFromThisBatch;
        
        // Agar partiya nolga tushsa, uni yopamiz
        if (batch.currentQuantity === 0) {
          batch.status = 'sold_out';
        }
        await batch.save();

        // Hisobot uchun: qaysi partiyadan qancha va qanday tan narxda olinganini yozamiz
        soldItemsReport.push({
          product: productId,
          quantity: amountFromThisBatch,
          salePrice: item.salePrice,
          costPrice: batch.costPrice, // Aynan shu partiyaning kelish narxi
          partyNumber: batch.partyNumber,
          name : batch.name
        });

        // Jami kerakli miqdordan ayirib boramiz
        quantityToDeduct -= amountFromThisBatch;
      }

      // 3. Tekshiruv: Agar hamma partiyalarni ko'rib chiqib ham miqdor yetmasa
      if (quantityToDeduct > 0) {
        throw new Error(`Omborda yetarli mahsulot yo'q. Yana ${quantityToDeduct} ta yetishmayapti.`);
      }

      // 4. Product modelidagi umumiy summani (summary) yangilash
      await Product.findByIdAndUpdate(productId, {
        $inc: { totalStock: -Number(item.quantity) }
      });

      totalSaleAmount += Number(item.quantity) * Number(item.salePrice);
    }

    // 5. Sotuvni yakuniy saqlash
    const sale = await SaleModel.create({
        orderNumber: orderNumber,
      items: soldItemsReport,
      totalAmount: totalSaleAmount,
      branchId: payload.branchId,
      paymentType: payload.paymentType,
      mixedDetails : payload.mixedDetails,
      customerId: payload.customerId || null,
      driverId: payload.driverId || null,
      author : author,
      date: now,
    });
    if(sale){
await BotDriverService.SentOrder(sale)
return { 
      success: true, 
      status: 201, 
      msg: "Sotuv muvaffaqiyatli yakunlandi!", 
      data: sale 
    };
    }else{
      return { 
      success: false, 
      status: 404, 
      msg: "Haydovchiga yuborishda xatolik yuz berdi!", 
    };
    }
  } catch (error) {
    console.error("Sale Error:", error);
    return { success: false, status: 400, msg: error.message };
  }
}
async GetAll(query) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      branchId, 
      driverId 
    } = query;
    // 1. Filtrlarni shakllantirish
    const filter = {};
    if (branchId) filter.branchId = branchId;
    if (driverId) filter.driverId = driverId;
    // Sana bo'yicha filtr (masalan: bugungi sotuvlar)
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 2. Ma'lumotlarni olish
    const sales = await SaleModel.find()
      .populate("customerId", "fullname phoneNumber address") // Kerakli maydonlarni aniq ko'rsatish
      .populate("driverId", "fullname phoneNumber role")
      .populate("author", "fullname phoneNumber")
      .sort({ createdAt: -1 }) // Yangilari tepada
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    // 3. Jami hujjatlar sonini hisoblash (Pagination uchun)
    const count = await SaleModel.countDocuments(filter);

    return {
      success: true,
      status: 200,
      msg: "Sotuvlar muvaffaqiyatli yuklandi",
      data: sales,
      pagination: {
        totalSales: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page)
      }
    };
  } catch (error) {
    console.error("GetAll Sales Error:", error);
    return { 
      success: false, 
      status: 500, 
      msg: "Ma'lumotlarni yuklashda xatolik yuz berdi" 
    };
  }
}
async GetByCustomerId(payload) {
  const { id, page = 1, limit = 10, startDate, endDate, branchId, driverId } = payload;
  
  try {
    // 1. Filtrlarni shakllantirish
    const filter = { customerId: id }; // Asosiy filtr - mijoz ID si

    if (branchId) filter.branchId = branchId;
    if (driverId) filter.driverId = driverId;

    // Sana bo'yicha filtr (Agar sana yuborilgan bo'lsa)
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 2. Ma'lumotlarni bazadan qidirish
    const sales = await SaleModel.find(filter) // Filtrni shu yerda qo'llaymiz
      .populate("customerId", "fullname phoneNumber address")
      .populate("driverId", "fullname phoneNumber role")
      .populate("author", "fullname phoneNumber")
      .sort({ date: -1 }) // createdAt emas, modeldagi 'date' bo'yicha saralash ma'qul
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // 3. Jami mos keluvchi hujjatlar sonini hisoblash
    const count = await SaleModel.countDocuments(filter);

    return {
      success: true,
      status: 200,
      msg: "Mijoz xaridlar tarixi yuklandi",
      data: {
        orders: sales, // Front-end 'orders' massivini kutyapti
        pagination: {
          totalSales: count,
          totalPages: Math.ceil(count / limit),
          currentPage: Number(page),
          limit: Number(limit)
        }
      }
    };
  } catch (error) {
    console.error("GetByCustomerId Error:", error);
    return { 
      success: false, 
      status: 500, 
      msg: "Xaridlar tarixini yuklashda xatolik yuz berdi",
      error: error.message 
    };
  }
}
async GetByEmployeeId(payload) {
  const { id, page = 1, limit = 10, startDate, endDate, branchId, driverId } = payload;
  console.log(payload)
  try {
    // 1. Filtrlarni shakllantirish
    const filter = { driverId: id }; // Asosiy filtr - mijoz ID si

    if (branchId) filter.branchId = branchId;
    if (driverId) filter.driverId = driverId;

    // Sana bo'yicha filtr (Agar sana yuborilgan bo'lsa)
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // 2. Ma'lumotlarni bazadan qidirish
    const sales = await SaleModel.find(filter) // Filtrni shu yerda qo'llaymiz
      .populate("customerId", "fullname phoneNumber address")
      .populate("driverId", "fullname phoneNumber role")
      .populate("author", "fullname phoneNumber")
      .sort({ date: -1 }) // createdAt emas, modeldagi 'date' bo'yicha saralash ma'qul
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // 3. Jami mos keluvchi hujjatlar sonini hisoblash
    const count = await SaleModel.countDocuments(filter);

    return {
      success: true,
      status: 200,
      msg: "Haydovchi xaridlar tarixi yuklandi",
      data: {
        orders: sales, // Front-end 'orders' massivini kutyapti
        pagination: {
          totalSales: count,
          totalPages: Math.ceil(count / limit),
          currentPage: Number(page),
          limit: Number(limit)
        }
      }
    };
  } catch (error) {
    console.error( error);
    return { 
      success: false, 
      status: 500, 
      msg: "Xaridlar tarixini yuklashda xatolik yuz berdi",
      error: error.message 
    };
  }
}
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
    const result = await ExportToExcelUniversal(data, columns, {
            title: "SOTUVLAR HISOBOTI",
            filename: `Sotuvlar_Hisoboti_${moment().format("DD_MM_YYYY")}`,
            sheetName: "Sotuvlar Ro'yxati"
        });
    
    if (!result || !result.buffer) {
      throw new Error("Excel faylini yaratishda xatolik yuz berdi (Buffer empty)");
    }

    return result; // { buffer, filename } qaytaradi
  } catch (error) {
    throw new Error(error.message);
  }
}
}

module.exports = new SaleposManagmentService();