const Inbound = require('../../../models/Supply/Inbound/inbound.model');
const Product = require('../../../models/Sale/products/product.model');

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
  async getAllInbounds(query = {}) {
    return await Inbound.find(query)
      .populate('branchId', 'name')
      .populate('supplierId', 'fullname')
      .populate('receivedBy', 'username')
      .sort({ createdAt: -1 });
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