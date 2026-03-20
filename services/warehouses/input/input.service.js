class WarehouseInputService {
  /**
   * 📥 Omborga yangi kirim qilish (Batch/Party entry)
   */
async create(req, payload) {
    const { ReadyWarehouse, Product, InboundHistory } = req.tenantModels;
    const userId = req.user?.id;
console.log(userId);

    try {
        // 1. Kiruvchi payloadni tekshirish
        if (!payload || !payload.items || !Array.isArray(payload.items)) {
            return { success: false, status: 400, msg: "Noto'g'ri so'rov formati!" };
        }

        const warehouseEntries = [];
        const historyItems = [];
        let totalInvoiceAmount = 0;
        const now = new Date();

        // 2. Ma'lumotlarni tozalash va tayyorlash
        for (const item of payload.items) {
            // Frontenddan kelayotgan IDni tekshirish
            const productId = item.product?._id || item.product;
            const initialQty = Number(item.initialQuantity);
            const costPrice = Number(item.costPrice);
            const salePrice = Number(item.salePrice);

            // MUHIM: Har bir itemni alohida tekshiramiz
            if (!productId || isNaN(initialQty) || isNaN(costPrice) || isNaN(salePrice)) {
                console.warn("⚠️ Noto'g'ri item tashlab ketildi:", item);
                continue; 
            }

            totalInvoiceAmount += (initialQty * costPrice);

            // ReadyWarehouse uchun yangi toza obyekt
            // Hech qanday "spread" (...) ishlatmasdan, har bir maydonni qo'lda yozamiz
            const entry = {
                product: productId,
                branchId: userId || "1",
                supplierId: userId || "1",
                partyNumber: String(payload.partyNumber || "F-001"),
                initialQuantity: initialQty,
                currentQuantity: initialQty, // currentQuantity = initialQuantity
                costPrice: costPrice,
                salePrice: salePrice,
                status: 'active',
                createdAt: now,
                author :userId
            };

            warehouseEntries.push(entry);

            historyItems.push({
                product: productId,
                qty: initialQty,
                costPrice: costPrice,
                salePrice: salePrice
            });
        }

        // 3. Agar massiv bo'sh bo'lsa, insertMany ga yubormaymiz
        if (warehouseEntries.length === 0) {
            return { success: false, status: 400, msg: "Yaroqli mahsulotlar topilmadi. Ma'lumotlarni tekshiring!" };
        }

        // 4. InboundHistory yaratish
        const history = await InboundHistory.create({
            partyNumber: String(payload.partyNumber || "F-001"),
            supplierId: userId || "1",
            branchId: userId || "1",
            items: historyItems,
            totalAmount: totalInvoiceAmount,
            author: userId,
            createdAt: now
        });

        // 5. ReadyWarehouse ga saqlash
        // Har bir entryga tarix IDsini qo'shamiz
        const finalEntries = warehouseEntries.map(e => ({ ...e, inputId: history._id }));
        
        // DEBUG: insertMany dan oldin oxirgi marta tekshirish
        console.log("🚀 Bazaga ketayotgan entries:", JSON.stringify(finalEntries[0], null, 2));

        await ReadyWarehouse.insertMany(finalEntries);

        // 6. Qoldiqlarni yangilash
        const updatePromises = historyItems.map(h => 
            Product.findByIdAndUpdate(h.product, { $inc: { totalStock: h.qty } })
        );
        await Promise.all(updatePromises);

        return { 
            success: true, 
            status: 201, 
            msg: `Kirim bajarildi! Faktura: ${payload.partyNumber}`,
            data: history 
        };

    } catch (error) {
        console.error("❌ INBOUND CRITICAL ERROR:", error);
        return { 
            success: false, 
            status: 500, 
            msg: "Serverda xatolik: " + error.message 
        };
    }
}

  /**
   * 📜 Kirimlar tarixini olish (Pagination bilan)
   */
 async getAll(req, query) {
  const { InboundHistory } = req.tenantModels;
  const { startDate, endDate, search } = query;

  try {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 15);
    const skip = (page - 1) * limit;

    let filter = {};

    // SANA FILTRI (createdAt bo'yicha)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // QIDIRUV
    if (search) {
      filter.partyNumber = { $regex: search, $options: "i" };
    }

    // MA'LUMOTNI OLISH
    const [items, total] = await Promise.all([
      InboundHistory.find(filter)
        .populate('supplierId', 'fullname')
        // .populate('author', 'fullname')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InboundHistory.countDocuments(filter)
    ]);

    return { 
      success: true, 
      data: items, 
      pagination: { 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit) 
      } 
    };

  } catch (error) {
    console.error("GET_ALL_ERROR:", error);
    return { success: false, msg: error.message };
  }
}

  /**
   * 📤 Mahsulotni ombordan chiqarish (Output/Sale)
   */
  async outputProduct(req, data) {
    const { ReadyWarehouse, Product } = req.tenantModels;
    const partyId = data.partyId?.id || data.partyId;
    const outputQty = Number(data.outputQuantity || data.output?.[0]?.outputQuantity);

    if (!outputQty || outputQty <= 0) {
        return { success: false, status: 400, msg: "Noto'g'ri chiqim miqdori" };
    }

    try {
      const party = await ReadyWarehouse.findById(partyId);
      if (!party) return { success: false, status: 404, msg: "Partiya topilmadi" };

      if (party.currentQuantity < outputQty) {
        return { success: false, status: 400, msg: `Mavjud qoldiq: ${party.currentQuantity}` };
      }
      
      // FIFO yoki Partiya bo'yicha kamaytirish
      party.currentQuantity -= outputQty;
      if (party.currentQuantity === 0) party.status = 'sold_out';

      await Promise.all([
        party.save(),
        Product.findByIdAndUpdate(party.product, { $inc: { totalStock: -outputQty } })
      ]);

      return { success: true, status: 200, msg: "Mahsulot chiqarildi", data: party };
    } catch (error) {
      return { success: false, status: 500, msg: error.message };
    }
  }

  /**
   * 🗑 Ma'lumotlarni tozalash (Tenant bazasini tozalash)
   */
  async clearAllData(req) {
    const { ReadyWarehouse, InputHistory, SaleModel, Product } = req.tenantModels;
    try {
      await Promise.all([
        ReadyWarehouse.deleteMany({}),
        InputHistory.deleteMany({}),
        SaleModel.deleteMany({}),
        Product.updateMany({}, { totalStock: 0 })
      ]);
      return { success: true, msg: "Faqat ushbu tenant ma'lumotlari tozalandi!" };
    } catch (error) {
      return { success: false, msg: error.message };
    }
  }
}

module.exports = new WarehouseInputService();