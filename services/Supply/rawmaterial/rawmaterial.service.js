const RawMaterial = require('../../../models/Supply/rawmaterial/rawmaterial.model');
const { generateQRCode } = require('../../../utils/generater');

class RawMaterialService {
    // async create(data) {
    //     return await RawMaterial.create(data);
    // }
async create(data) {
    const { action, model } = data;

    try {
      // --- 1. YARATISH (CREATE) ---
      if (action === "create") {
        // Dublikatlarni tekshirish (isActive: true bo'lganlar orasidan)
        const materialExists = await RawMaterial.exists({
          $and: [
            { isActive: true },
            { $or: [{ name: model.name }, { code: model.code }] }
          ]
        });

        if (materialExists) {
          return { status: "400", msg: "Bunday xomashyo nomi yoki kodi allaqachon mavjud!" };
        }

        // QR kod generatsiya qilish
        if (model.code) {
          model.qr = await generateQRCode(model.code);
        }

        // Ma'lumotlarni sanitarizatsiya qilish (manfiy sonlarni oldini olish)
        const newMaterial = new RawMaterial({
          ...model,
        //   costPrice: Math.abs(model.costPrice || 0),
        //   fatContent: Math.max(0, model.fatContent || 0),
          isActive: true
        });

        const saved = await newMaterial.save();
        
        return { 
          status: "200", 
          msg: "Xomashyo muvaffaqiyatli qo'shildi!", 
          data: saved 
        };
      }

      // --- 2. TAHRIRLASH (UPDATE) ---
      if (action === "update") {
        const { _id, ...updateData } = model;

        // Xomashyo mavjudligini tekshirish
        const currentMaterial = await RawMaterial.findById(_id);
        if (!currentMaterial) {
          return { status: "404", msg: "O'zgartirish uchun xomashyo topilmadi!" };
        }

        // Agar kod o'zgargan bo'lsa, yangi QR kod yaratish va dublikatni tekshirish
        if (updateData.code && updateData.code !== currentMaterial.code) {
          const codeExists = await RawMaterial.exists({
            _id: { $ne: _id },
            code: updateData.code,
            isActive: true
          });

          if (codeExists) {
            return { status: "400", msg: "Bu kod boshqa xomashyoga biriktirilgan!" };
          }

          // Yangi kod uchun QR generatsiya
          updateData.qr = await generateQRCode(updateData.code);
        }

        // Ma'lumotlarni yangilash
        const updated = await RawMaterial.findByIdAndUpdate(
          _id, 
          { $set: updateData }, 
          { new: true, runValidators: true }
        );

        return { 
          status: "200", 
          msg: "Xomashyo ma'lumotlari yangilandi!", 
          data: updated 
        };
      }

      return { status: "400", msg: "Noto'g'ri amal turi (action error)" };

    } catch (error) {
      console.error("Error in RawMaterial Save:", error);
      
      // Mongoose unique error handling
      if (error.code === 11000) {
        return { status: "400", msg: "Xato: Identifikatsiya kodi takrorlanmas bo'lishi shart!" };
      }

      throw new Error("Xomashyoni saqlashda texnik xatolik: " + error.message);
    }
  }
    async getAll(filter = {}) {
        return await RawMaterial.find({ ...filter, isActive: true }).sort({ createdAt: -1 });
    }

    async getById(id) {
        return await RawMaterial.findById(id);
    }

    async getByCode(code) {
        return await RawMaterial.findOne({ code, isActive: true });
    }

    async update(id, data) {
        return await RawMaterial.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await RawMaterial.findByIdAndUpdate(id, { isActive: false });
    }

    // Ombor qoldig'ini yangilash (Kirim/Chiqim uchun mantiq)
    async updateStock(id, qty) {
        return await RawMaterial.findByIdAndUpdate(
            id, 
            { $inc: { totalStock: qty } }, 
            { new: true }
        );
    }
}

module.exports = new RawMaterialService();