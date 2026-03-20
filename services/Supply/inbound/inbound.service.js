const { generateUniqueLabNumber } = require('../../../utils/generateUniqueNumber');

class InboundService {
  /**
   * Partiya (Batch) raqamini generatsiya qilish
   */
  generateBatchNumber() {
    const prefix = "CON";
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(100000000 + Math.random() * 900000000);
    return `${prefix}-${year}-${randomNumber}`;
  }

  /**
   * 📥 Yangi kirim hujjatini yaratish
   */
  async createInbound(req, data, userId) {
    const { SupplyInbound, Product } = req.tenantModels;
    try {
      let calculatedTotalAmount = 0;
      
      const processedItems = data.items.map(item => {
        const qty = Number(item.qty) || 0;
        const price = Number(item.costPrice) || 0;
        calculatedTotalAmount += (qty * price);
        
        return { ...item, qty, costPrice: price };
      });

      const newInbound = new SupplyInbound({
        ...data,
        items: processedItems,
        totalAmount: calculatedTotalAmount,
        code: this.generateBatchNumber(),
        receivedBy: userId,
        status: 'Completed' // Laboratoriya tasdig'ini kutayotgan holat
      });

      // Ombor qoldig'ini yangilash
      const stockUpdates = processedItems.map(item => {
        return Product.findByIdAndUpdate(item.productId, {
          $inc: { totalStock: item.qty },
          $set: { lastPurchasePrice: item.costPrice }
        });
      });

      await Promise.all([...stockUpdates, newInbound.save()]);
      return newInbound;
      
    } catch (error) {
      throw new Error(`Kirimni saqlashda xato: ${error.message}`);
    }
  }

  /**
   * 📊 Barcha kirimlar ro'yxati
   */
  async getAllInbounds(req) {
    const { SupplyInbound } = req.tenantModels;
    return await SupplyInbound.find()
      .populate('branchId', 'name')
      .populate('counterparty', 'fullname phoneNumber')
      .populate('receivedBy', 'fullname')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * 🔬 Laboratoriya tahlilini saqlash va statusni yangilash
   */
  async saveLabAnalysis(req, payload, userId) {
    const { InboundHistory, LabAnalysis } = req.tenantModels;
    try {
      const { inboundBatchIds, labResults, distribution, totalPhysicalVolume } = payload;

      // 1. Laboratoriya hujjati
      const newAnalysis = new LabAnalysis({
        partyNumber: await generateUniqueLabNumber(req),
        inboundBatchIds,
        results: labResults,
        distribution,
        totalVolume: totalPhysicalVolume,
        author: userId,
        status: 'Accepted'
      });

      const savedAnalysis = await newAnalysis.save();

      // 2. Kirim partiyalarini yangilash
      // Bir nechta partiya bitta lab tahlilida birlashishi mumkin
      await InboundHistory.updateMany(
        { _id: { $in: inboundBatchIds } },
        { 
          $set: { 
            status: 'Accepted', 
            labAnalysisId: savedAnalysis._id 
          } 
        }
      );

      return {
        success: true,
        message: "Laboratoriya tahlili muvaffaqiyatli saqlandi",
        analysisId: savedAnalysis._id
      };
    } catch (error) {
      throw new Error(`Lab tahlilida xato: ${error.message}`);
    }
  }

  /**
   * 🔍 ID bo'yicha kirimni topish
   */
  async getInboundById(req, id) {
    const { Inbound } = req.tenantModels;
    const inbound = await Inbound.findById(id)
      .populate('items.productId')
      .populate('branchId counterparty receivedBy labAnalysisId');
      
    if (!inbound) throw new Error("Kirim hujjati topilmadi");
    return inbound;
  }
}

module.exports = new InboundService();