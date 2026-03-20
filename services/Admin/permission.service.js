// ❌ Statik importni o'chirib tashlang
// const PermissionModel = require("../../models/Admin/permission.model");

class PermissionService {
  async CreatePermission(req, data) {
    // ✅ Modellarni dinamik ravishda olamiz
    const { Permission } = req.tenantModels;

    try {
      // Bir xil nom yoki qiymatli ruxsat borligini tekshirish
      const isExists = await Permission.findOne({
        $or: [
          { name: data.name },
          { value: data.value }
        ]
      });

      if (!isExists) {
        // ✅ Yangi ruxsatni yaratish
        const permission = await Permission.create(data);
        return { msg: "Ruxsat muvaffaqiyatli qo‘shildi!", permission };
      } else {
        return { msg: "Bunday nomdagi yoki qiymatdagi ruxsat allaqachon mavjud." };
      }
    } catch (err) {
      console.error("Permission Create Error:", err.message);
      return { msg: "Xatolik yuz berdi", error: err.message };
    }
  }

  async GetAll(req) {
    const { Permission } = req.tenantModels;

    try {
      const permissions = await Permission.find().lean();
      return { msg: "Barcha ruxsatnomalar", permissions };
    } catch (err) {
      console.error("Permission GetAll Error:", err.message);
      return { msg: "Xatolik yuz berdi", error: err.message };
    }
  }
}

module.exports = new PermissionService();