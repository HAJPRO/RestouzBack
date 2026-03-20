class InboundService {
  /**
   * Partiya (Batch) raqamini generatsiya qilish
   * Format: CON-2026-123456789
   */
  generateBatchNumber() {
    const prefix = "CON";
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix}-${year}-${randomNumber}`;
  }

  /**
   * Yangi kirim hujjatini yaratish (Tenant-based)
   */
  async createInbound(req, data, userId) {
    const { AccessoriesInbound, Accessory } = req.tenantModels; // ✅ Dinamik modellar

    try {
      let calculatedTotalAmount = 0;

      // 1. Itemlarni qayta ishlash
      const processedItems = data.items.map(item => {
        const qty = Number(item.qty) || 0;
        const costPrice = Number(item.costPrice) || 0;
        calculatedTotalAmount += (qty * costPrice);

        return {
          ...item,
          qty,
          costPrice,
          // Agar item darajasida partiya raqami kerak bo'lsa, shu yerda qo'shish mumkin
        };
      });

      // 2. Yangi inbound yaratish
      const newInbound = new AccessoriesInbound({
        ...data,
        items: processedItems,
        totalAmount: calculatedTotalAmount,
        code: this.generateBatchNumber(),
        receivedBy: userId,
        status: 'Completed'
      });

      // 3. Ombor qoldig'ini yangilash (Stock Management)
      const stockUpdates = processedItems.map(item => {
        return Accessory.findByIdAndUpdate(item.productId, {
          $inc: { totalStock: item.qty },
          $set: { lastPurchasePrice: item.costPrice }
        });
      });

      // Barcha yangilanishlarni parallel bajarish
      await Promise.all(stockUpdates);
      
      // Hujjatni saqlash
      return await newInbound.save();

    } catch (error) {
      console.error("Inbound Create Error:", error);
      throw new Error(`Kirimni saqlashda xato: ${error.message}`);
    }
  }

  /**
   * Barcha kirimlar ro'yxatini olish (Filtrlar bilan)
   */
  async getAllInbounds(req, query = {}) {
    console.log("ok")
    const { AccessoriesInbound } = req.tenantModels;
    try {
      const { 
        page = 1, 
        limit = 15, 
        search, 
        counterparty, 
        status, 
        labStatus, 
        startDate, 
        endDate 
      } = query;

      const filter = {};

      if (search) {
        filter.$or = [
          { code: { $regex: search, $options: 'i' } },
          { 'items.name': { $regex: search, $options: 'i' } }
        ];
      }

      if (counterparty) filter.counterparty = counterparty;
      if (status) filter.status = status;
      if (labStatus) filter['items.labStatus'] = labStatus;

      // Sana bo'yicha filtr
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }

      const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
      
      const [docs, totalDocs] = await Promise.all([
        AccessoriesInbound.find(filter)
          .populate('branchId', 'name fullname')
          .populate('counterparty', 'fullname') 
          .populate('receivedBy', 'fullname')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        AccessoriesInbound.countDocuments(filter)
      ]);

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
  async getInboundById(req, id) {
    const { AccessoriesInbound } = req.tenantModels;
    const inbound = await AccessoriesInbound.findById(id)
      .populate('items.productId')
      .populate('branchId counterparty receivedBy');
      
    if (!inbound) throw new Error("Kirim hujjati topilmadi");
    return inbound;
  }
}

module.exports = new InboundService();