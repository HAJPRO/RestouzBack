// ❌ Statik importni o'chirib tashlang
// const RoleModel = require("../../models/Admin/role.model");

class RoleService {
  /**
   * Yangi rol yaratish
   * @param {Object} req - Express so'rov obyekti (tenantModels uchun)
   * @param {Object} data - Rol ma'lumotlari (name, value, permissions)
   */
  async Create(req, data) {
    // ✅ Modellarni dinamik ravishda req ichidan olamiz
    const { Role } = req.tenantModels;

    try {
      // Bir xil nom yoki qiymatli rol borligini tekshirish
      const isExists = await Role.findOne({
        $or: [
          { name: data.name },
          { value: data.value }
        ]
      });

      if (!isExists) {
        // ✅ Yangi rolni yaratish
        const role = await Role.create(data);
        return { 
          status: 201, 
          msg: "Rol muvaffaqiyatli qo‘shildi!", 
          role 
        };
      } else {
        return { 
          status: 400, 
          msg: "Bunday nomdagi yoki qiymatdagi rol allaqachon mavjud." 
        };
      }
    } catch (err) {
      console.error("Role Create Error:", err.message);
      return { msg: "Xatolik yuz berdi", error: err.message };
    }
  }

  /**
   * Barcha rollarni olish
   * @param {Object} req - Express so'rov obyekti
   */
  async GetAll(req) {
    const { Role } = req.tenantModels;

    try {
      // .populate("permissions") - agar rolda ruxsatnomalar IDlari bo'lsa, ularni ham tortib keladi
      const roles = await Role.find().lean();
      return { 
        status: 200, 
        msg: "Barcha rollar ro'yxati", 
        roles 
      };
    } catch (err) {
      console.error("Role GetAll Error:", err.message);
      return { msg: "Xatolik yuz berdi", error: err.message };
    }
  }
}

module.exports = new RoleService();