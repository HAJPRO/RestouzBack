const { ExportExcelSupplierInbounds } = require("../../../utils/ExportExcel");
const { generateQRCode } = require("../../../utils/generater");

class CounterpartyService {
  /**
   * 📌 Kontragent (Yetkazib beruvchi) yaratish va tahrirlash
   */
  async Save(req, data) {
    const { Counterparty } = req.tenantModels; // ✅ Tenantga xos model
    const { action, model } = data;

    try {
      if (action === "create") {
        // 1. Unikallikni tekshirish (Tenant doirasida)
        const supplierExists = await Counterparty.exists({ 
            $or: [{ fullname: model.fullname }, { code: model.code }] 
        });

        if (supplierExists) {
          return { status: "400", msg: "Bunday kontragent yoki kod bazada mavjud!" };
        }

        // 2. QR kod generatsiya qilish
        if (model.code) {
          model.qr = await generateQRCode(model.code);
        }

        const supplier = new Counterparty({
            ...model,
            author: req.user?._id // Yaratuvchini belgilash
        });
        await supplier.save();
        
        return { status: "200", msg: "Kontragent muvaffaqiyatli qo'shildi!", data: supplier };
      }

      if (action === "update") {
        const { _id, ...updateData } = model;

        // 3. Kod o'zgargan bo'lsa QR kodni yangilash
        if (updateData.code) {
          const current = await Counterparty.findById(_id);
          if (current && current.code !== updateData.code) {
             updateData.qr = await generateQRCode(updateData.code);
          }
        }

        const updated = await Counterparty.findByIdAndUpdate(_id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updated) {
          return { status: "404", msg: "Yangilanadigan kontragent topilmadi!" };
        }

        return { status: "200", msg: "Ma'lumotlar yangilandi!", data: updated };
      }

      return { status: "400", msg: "Noto'g'ri amal turi" };
    } catch (error) {
      console.error("Counterparty Save Error:", error);
      return { status: "500", msg: error.message };
    }
  }

  /**
   * 📌 Kontragentlar ro'yxatini filter bilan olish
   */
  async GetAll(req, data) {
    console.log(data)
    const { Counterparty } = req.tenantModels;
    try {
      let data = { isActive: true }; // O'chirilmaganlarni olish (tavsiya)
      
      if (data.filter && data.filter.fullname) {
        query.$or = [
          { fullname: { $regex: data.filter.fullname, $options: "i" } },
          { phoneNumber: { $regex: data.filter.fullname, $options: "i" } },
          { inn: { $regex: data.filter.fullname, $options: "i" } }
        ];
      }

      const [counterparties, count] = await Promise.all([
        Counterparty.find().sort({ createdAt: -1 }).lean(),
        Counterparty.countDocuments()
      ]);

      return { 
        success: true, 
        counterparties, 
        all_length: { all: count } 
      };
    } catch (error) {
      return { status: 500, msg: error.message, counterparties: [] };
    }
  }

  /**
   * 📌 O'chirish (Soft Delete)
   */
  async DeleteById(req, id) {
    const { Counterparty } = req.tenantModels;
    try {
      // Fizik o'chirish o'rniga isActive: false qilish xavfsizroq
      const deleted = await Counterparty.findByIdAndUpdate(id, { isActive: false });
      if (!deleted) return { status: 404, msg: "Topilmadi!" };
      return { status: 200, msg: "Kontragent o'chirildi!" };
    } catch (error) {
      return { status: 500, msg: error.message };
    }
  }

  /**
   * 📌 Kontragentning kirimlar tarixi (Supply History)
   */
  async GetInboundsBySupplierId(req, data) {
    const { Inbound } = req.tenantModels; // ✅ To'g'ri model (accessoriesInbound)
    const id = data.id;
    try {
      const inbounds = await Inbound.find({ counterparty: id }) // Inbound modelidagi maydon nomiga qarang
        .populate("receivedBy", "fullname phoneNumber")
        .sort({ createdAt: -1 })
        .lean();

      return { status: 200, inbounds };
    } catch (error) {
      return { status: 500, msg: `Server xatosi: ${error.message}` };
    }
  }

  /**
   * 📌 Excel Export
   */
  async ExportExcelDownload(data) {
    try {
      const result = await ExportExcelSupplierInbounds(data);
      if (!result || !result.buffer) {
        throw new Error("Excel yaratishda xatolik");
      }
      return result;
    } catch (error) {
      throw new Error("Export Error: " + error.message);
    }
  }
}

module.exports = new CounterpartyService();