const Counterparty = require("../../../models/Supply/counterparty.model"); // Mijoz o'rniga Yetkazib beruvchi modeli
const Inbound = require("../../../models/Supply/counterparty.model");    // Sotuv o'rniga Kirim modeli
const { ExportExcelSupplierInbounds } = require("../../../utils/ExportExcel");
const { generateQRCode } = require("../../../utils/generater");
class CounterpartyService {
  // 📌 Kontragent yaratish va tahrirlash
 async Save(data) {
    const action = data.action;
    const model = data.model;

    try {
      if (action === "create") {
        // 1. Nom yoki Kod bo'yicha takrorlanishni tekshirish
        const supplierExists = await Counterparty.exists({ 
            $or: [{ fullname: model.fullname }, { code: model.code }] 
        });

        if (supplierExists) {
          return { status: "400", msg: "Bunday kontragent yoki kod bazada mavjud!" };
        }

        // 2. QR kod generatsiya qilish (model.code asosida)
        if (model.code) {
          model.qr = await generateQRCode(model.code);
        }

        const supplier = new Counterparty(model);
        await supplier.save();
        
        return { status: "200", msg: "Kontragent muvaffaqiyatli qo'shildi!" };
      }

      if (action === "update") {
        const { _id, ...updateData } = model;

        // 3. Agar kod o'zgargan bo'lsa, yangi QR kod generatsiya qilish
        if (updateData.code) {
          updateData.qr = await generateQRCode(updateData.code);
        }

        const updated = await Counterparty.findByIdAndUpdate(_id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updated) {
          return { status: "404", msg: "O'zgartirish uchun kontragent topilmadi!" };
        }

        return { status: "200", msg: "Ma'lumotlar muvaffaqiyatli yangilandi!", data: updated };
      }

      return { status: "400", msg: "Noto'g'ri amal turi" };
    } catch (error) {
      console.error("Error in Counterparty Save:", error);
      throw new Error("Error in Counterparty Save: " + error.message);
    }
  }

  // 📌 Umumiy sonini olish
  async getAllLength() {
    try {
      const count = await Counterparty.countDocuments();
      return { all: count };
    } catch (error) {
      return { all: 0 };
    }
  }

  // 📌 Filtrlangan ro'yxatni olish
  async GetAll(data) {
    try {
      const all_length = await this.getAllLength();
      
      // Qidiruv filtri
      let query = {};
      if (data.filter && data.filter.fullname) {
        query = {
          $or: [
            { fullname: { $regex: data.filter.fullname, $options: "i" } },
            { phoneNumber: { $regex: data.filter.fullname, $options: "i" } },
            { inn: { $regex: data.filter.fullname, $options: "i" } } // STIR bo'yicha ham qidirish
          ]
        };
      }

      const counterparties = await Counterparty.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return { counterparties, all_length };
    } catch (error) {
      return {
        status: 500,
        msg: `Server xatosi: ${error.message}`,
        counterparties: [],
        all_length: { all: 0 },
      };
    }
  }

  // 📌 O'chirish
  async DeleteById(data) {
    try {
      const deleted = await Counterparty.findByIdAndDelete(data.id);
      if (!deleted) return { status: 404, msg: "Kontragent topilmadi!" };
      return { status: 200, msg: "Kontragent o'chirildi!" };
    } catch (error) {
      return { status: 500, msg: `Xatolik: ${error.message}` };
    }
  }

  // 📌 ID bo'yicha bittasini olish
  async GetById(data) {
    try {
      const counterparty = await Counterparty.findById(data.id);
      if (!counterparty) return { status: 404, msg: "Topilmadi!" };
      return { status: 200, counterparty };
    } catch (error) {
      return { status: 500, msg: error.message };
    }
  }

  // 📌 Kontragentning sut topshirish tarixi (Kirimlar)
  async GetInboundsBySupplierId(data) {
    const id = data.id;
    try {
      // Inbound (Kirim) modelidan supplierId bo'yicha qidiramiz
      const inbounds = await Inbound.find({ supplierId: id })
        .populate("author", "fullname phoneNumber") // Kim qabul qilgani
        .sort({ date: -1 });

      return { status: 200, inbounds };
    } catch (error) {
      return { status: 500, msg: `Server xatosi: ${error.message}` };
    }
  }

  // 📌 Excel hisobot yaratish
  async ExportExcelDownload(data) {
    try {
      // Sut kirimlari bo'yicha hisobot yaratish utilini chaqiramiz
      const result = await ExportExcelSupplierInbounds(data);
      if (!result || !result.buffer) {
        throw new Error("Excel yaratishda xatolik (Buffer bo'sh)");
      }
      return result;
    } catch (error) {
      throw new Error("Excel Export Error: " + error.message);
    }
  }
}

module.exports = new CounterpartyService();