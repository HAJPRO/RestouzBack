const Inbound = require('../../../models/Supply/accessories/accessoriesInbound.model');
const Product = require('../../../models/Supply/accessories/accessory.model');
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
async getAllInbounds(query = {},userId) {
  console.log(query,userId)
  try {
    const { 
      page = 1, 
      limit = 15, 
      search, 
      counterparty, 
      status, 
      labStatus, // Yangi: Lab xulosasi bo'yicha filtr
      startDate, 
      endDate 
    } = query;

    // 1. Filtr obyektini yig'ish
    const filter = {};

    // Qidiruv logikasi
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } } // Mahsulot nomi bo'yicha ham qidirish
      ];
    }

    // ID orqali filtr (Counterparty ID shaklida keladi)
    if (counterparty) filter.counterparty = counterparty;
    
    // Status (Completed, Pending va h.k.)
    if (status) filter.status = status;

    // Laboratoriya holati bo'yicha filtr (Agar items ichida bo'lsa)
    if (labStatus) {
      filter['items.labStatus'] = labStatus;
    }

    // Sana bo'yicha filtr (Vaqt oralig'ini to'g'ri hisoblash)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // 2. Ma'lumotlarni parallel ravishda olish
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    
    const [docs, totalDocs] = await Promise.all([
      Inbound.find(filter)
        .populate('branchId', 'name fullname') // Dashboardingizda 'name' ishlatilgan
        .populate('counterparty', 'fullname') 
        .populate('receivedBy', 'fullname')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(), // Lean() so'rovni tezlashtiradi (faqat JSON qaytaradi)
      Inbound.countDocuments(filter)
    ]);

    // Front-end pagination uchun natija
    return {
      docs,
      totalDocs,
      totalPages: Math.ceil(totalDocs / Number(limit)) || 1,
      page: Number(page),
      limit: Number(limit)
    };
  } catch (error) {
    console.error("Error in getAllInbounds:", error);
    throw error;
  }
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

  
}

module.exports = new InboundService();