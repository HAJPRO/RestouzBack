const Inbound = require('../../../models/Supply/Inbound/inbound.model');
const Product = require('../../../models/Sale/products/product.model');
const Loboratory = require('../../../models/Laboratory/laboratory.model');
const { generateUniqueLabNumber } = require('../../../utils/generateUniqueNumber');


class InboundService {
  /**
   * Yangi kirim hujjatini yaratish
   */
   generateBatchNumber() {
  const prefix = "CON";
  const year = new Date().getFullYear();
  const min = 100000000;
  const max = 999999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return `${prefix}-${year}-${randomNumber}`;
}

async createInbound(data, userId) {
  try {
    // 1. Umumiy summani qayta hisoblash va Har bir itemga Batch Number biriktirish
    let calculatedTotalAmount = 0;
    
    const processedItems = data.items.map(item => {
      calculatedTotalAmount += (item.qty * item.costPrice);
      
      return {
        ...item,
        // Agar front-enddan batchNumber kelmagan bo'lsa, back-endda generatsiya qilamiz
      };
    });

    // 2. Yangi inbound yaratish
    const newInbound = new Inbound({
      ...data,
      items: processedItems, // Batch number qo'shilgan yangi array
      totalAmount: calculatedTotalAmount,
       code : this.generateBatchNumber(),

      receivedBy: userId,
      status: 'Completed'
    });

    // 3. Ombor qoldig'ini yangilash (Stock Management)
    const stockUpdates = processedItems.map(item => {
      return Product.findByIdAndUpdate(item.productId, {
        $inc: { totalStock: item.qty },
        $set: { lastPurchasePrice: item.costPrice }
      });
    });

    // Barcha yangilanishlarni parallel bajarish
    await Promise.all(stockUpdates);
    
    // Hujjatni saqlash
    return await newInbound.save();
    
  } catch (error) {
    throw new Error(`Kirimni saqlashda xato: ${error.message}`);
  }
}

  /**
   * Barcha kirimlar ro'yxatini olish (Filtrlar bilan)
   */
  async getAllInbounds() {
    const inbounds = await Inbound.find()
      .populate('branchId', 'name')
      .populate('counterparty')
      .populate('receivedBy')
      .sort({ createdAt: -1 });
console.log(inbounds)
      return inbounds
  }

  /**
   * ID bo'yicha kirimni topish
   */
  async getInboundById(id) {
    const inbound = await Inbound.findById(id)
      .populate('items.productId')
      .populate('branchId supplierId receivedBy');
      
    if (!inbound) throw new Error("Kirim hujjati topilmadi");
    return inbound;
  }

   async saveLabAnalysis(payload, userId) {
  try {
    const { inboundBatchIds, labResults, distribution, totalPhysicalVolume } = payload;
console.log(payload);

    // 1. Yangi Laboratoriya hujjati yaratish (Laboratory Model)
    const newAnalysis = new Loboratory({
      partyNumber : await  generateUniqueLabNumber(),
      inboundBatchIds,      // Birlashtirilgan partiyalar ID lari
      results: labResults,  // fat, density, acidity, quality
      distribution,         // { "Smetana 20%": 150, ... }
      totalVolume: totalPhysicalVolume,
      author: userId,       // Tahlilni o'tkazgan xodim
      status: 'Accepted'
    });

    const savedAnalysis = await newAnalysis.save();

    // 2. Tanlangan Inbound partiyalarini yangilash
    // Har bir partiyaga labAnalysis ID sini biriktiramiz va statusini o'zgartiramiz
    const updateBatches = inboundBatchIds.map(id => {
      return Inbound.findByIdAndUpdate(id, {
        $set: {
          status: 'Accepted', // Kirim yakunlandi
          labAnalysisId: savedAnalysis._id, // Laboratoriya xulosasiga havola
          // Partiya ichidagi itemsga ham lab natijalarini nusxalash (ixtiyoriy)
          // 'items.0.fat': labResults.fat,
          // 'items.0.density': labResults.density,
          // 'items.0.acidity': labResults.acidity,
          // 'items.0.labStatus': 'Accepted'
        }
      });
    });

    await Promise.all(updateBatches);

    return {
      success: true,
      message: "Laboratoriya tahlili saqlandi va partiyalar yangilandi",
      analysisId: savedAnalysis._id
    };
  } catch (error) {
    throw new Error(`Laboratoriya tahlilini saqlashda xato: ${error.message}`);
  }
}
}

module.exports = new InboundService();