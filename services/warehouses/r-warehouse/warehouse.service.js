const { generateUniquePartyNumber } = require("../../../utils/generateUniqueNumber");

class ReadyWarehouseService {
  /**
   * 📄 Yangi partiya uchun model taqdim etish
   */
  async GetModel() {
    const partyNumber = await generateUniquePartyNumber();
    const model = {
      partyNumber: partyNumber,
      supplier: "",
      manufacturer: "",
      senderEmployee: "",
      receivedBy: "",
      receivedDate: new Date(),
      author: "",
      notes: "",
      totalAmount: 0,
      products: [], // Amaldagi qoldiq
      input: [],    // Kirimlar tarixi
      output: [],   // Chiqimlar tarixi
    };

    return { msg: "Model taqdim qilindi!", model };
  }

  /**
   * 🏗 Partiya yaratish yoki yangilash (Tenant-aware)
   */
  async Create(req, data) {
    const { ReadyWarehouse } = req.tenantModels;
    const { model, action } = data;

    try {
      if (action === "create") {
        // Partiya raqami takrorlanmasligini tekshirish
        const existingParty = await ReadyWarehouse.exists({ partyNumber: model.partyNumber });
        if (existingParty) {
          return { status: 400, msg: "Ushbu partiya raqami allaqachon mavjud!" };
        }

        const newParty = new ReadyWarehouse({
          ...model,
          author: req.user?.id,
          input: model.products // Dastlabki kirim
        });

        await newParty.save();
        return { status: 200, msg: "Partiya muvaffaqiyatli yaratildi!" };
      }

      if (action === "update") {
        const { id, newDataArray } = model;
        const updated = await ReadyWarehouse.findByIdAndUpdate(
          id,
          {
            $push: {
              input: { $each: newDataArray },
              products: { $each: newDataArray },
            },
          },
          { new: true, runValidators: true }
        );

        if (!updated) return { status: 404, msg: "Partiya topilmadi!" };
        return { status: 200, msg: "Partiya muvaffaqiyatli yangilandi!" };
      }

      return { status: 400, msg: "Noto'g'ri amal turi" };
    } catch (error) {
      return { status: 500, msg: `Xatolik: ${error.message}` };
    }
  }

  /**
   * 📊 Barcha partiyalarni filtrlash va olish
   */
  async GetAll(req, query) {
    console.log(query)
    const { ReadyWarehouse } = req.tenantModels;
    try {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.max(1, Number(query.limit) || 15);
      const skip = (page - 1) * limit;

      const filter = {};
      if (query.author) filter.author = query.author;
      if (query.search) {
        filter.partyNumber = { $regex: query.search, $options: "i" };
      }

      const [products, total] = await Promise.all([
        ReadyWarehouse.find(filter)
          .populate("products.product")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ReadyWarehouse.countDocuments(filter)
      ]);

      return { products, all_length: { all: total }, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      return { status: 500, msg: `Server xatosi: ${error.message}` };
    }
  }

  /**
   * 📤 Mahsulotni partiyadan chiqarish (Chiqim)
   */
  async OutputProduct(req, data) {
    const { ReadyWarehouse } = req.tenantModels;
    const { partyId, output } = data;

    try {
      const outputItems = Array.isArray(output) ? output : [output];
      const party = await ReadyWarehouse.findById(partyId.id || partyId);

      if (!party) return { status: 404, msg: "Partiya topilmadi" };

      for (const outItem of outputItems) {
        const target = party.products.id(outItem._id);
        
        if (!target) continue;
        if (target.quantity < outItem.outputQuantity) {
          return { status: 400, msg: `Miqdor yetarli emas: ${target.product}` };
        }

        // 1. Qoldiqni kamaytirish
        target.quantity -= outItem.outputQuantity;

        // 2. Chiqim tarixiga qo'shish
        party.output.push({
          ...target.toObject(),
          quantity: outItem.outputQuantity,
          outputDate: new Date(),
          outputResponsible: req.user?._id
        });
      }

      await party.save();
      return { status: 200, msg: "Chiqim muvaffaqiyatli bajarildi", data: party.products };
    } catch (error) {
      return { status: 500, msg: error.message };
    }
  }

  /**
   * 🗑 O'chirish mantiqi
   */
  async DeleteById(req, data) {
    const { ReadyWarehouse } = req.tenantModels;
    const { id, action } = data;

    try {
      if (action === 4) { // Butunlay o'chirish
        const deleted = await ReadyWarehouse.findByIdAndDelete(id);
        return deleted ? { status: 200, msg: "Partiya o'chirildi" } : { status: 404, msg: "Topilmadi" };
      }

      // Ichki elementlarni o'chirish (input/output/products)
      const fieldMap = { 1: "input", 2: "products", 3: "output" };
      const field = fieldMap[action];

      if (!field) return { status: 400, msg: "Noto'g'ri action" };

      await ReadyWarehouse.updateOne(
        { [`${field}._id`]: id },
        { $pull: { [field]: { _id: id } } }
      );

      return { status: 200, msg: "Ma'lumot o'chirildi" };
    } catch (error) {
      return { status: 500, msg: error.message };
    }
  }
}

module.exports = new ReadyWarehouseService();