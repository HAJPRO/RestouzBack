// ❌ Statik importlarni o'chirib tashlaymiz
// const Driver = require("../../../bots/model/drivers/driver.model");
// const UserModel = require("../../../models/user.model");

class CustomerManagmentService {

  // 📌 Mijozlar sonini olish
  async getAllLength(req) {
    const { Customer } = req.tenantModels;
    try {
      // countDocuments() find().length ga qaraganda ancha tez ishlaydi
      const all = await Customer.countDocuments();
      return { all };
    } catch (error) {
      console.error("Count error:", error.message);
      return { all: 0 };
    }
  }

  // 📌 Haydovchilarni olish (Agar status 0 bo'lsa)
  async GetAll(req, data) {
    const { User } = req.tenantModels;
    try {
      if (data.status === 0) {
        // Rol bo'yicha haydovchilarni qidirish
        const drivers = await User.find({
          role: { $in: ['driver', 'Haydovchi'] }
        }).select("-password").lean();
        
        return { drivers };
      } else {
        // Agar status 0 bo'lmasa, bo'sh qaytarish yoki boshqa mantiq
        return { msg: "Noto'g'ri status kodi", drivers: [] };
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}`, drivers: [] };
    }
  }

  // 📌 Barcha mijozlarni paginatsiya bilan olish
  async GetAllCustomers(req, data) {
    const { Customer } = req.tenantModels;
    const page = Number(data.page) || 1;
    const limit = Number(data.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const customers = await Customer.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      return customers.length ? customers : [];
    } catch (error) {
      throw new Error(`Mijozlarni yuklashda xatolik: ${error.message}`);
    }
  }

  // 📌 Mijozni ID orqali o'chirish
  async DeleteById(req, data) {
    const { Customer } = req.tenantModels;
    const id = data.id;
    try {
      const customer = await Customer.findByIdAndDelete(id);
      if (!customer) {
        return { msg: "Bunday mijoz topilmadi!" };
      }
      return { msg: "Mijoz muvaffaqiyatli o'chirildi!" };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

  // 📌 Mijozni ID orqali olish
  async GetById(req, data) {
    const { Customer } = req.tenantModels;
    const id = data.id;  
    try {
      const customer = await Customer.findById(id).lean();
      if (!customer) {
        return { msg: "Bunday mijoz topilmadi!" };
      }
      return { msg: "Mijoz muvaffaqiyatli aniqlandi!", customer };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }
}

module.exports = new CustomerManagmentService();