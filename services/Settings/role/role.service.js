
class RoleService {
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
  async GetAll(req) {
    const { Role } = req.tenantModels;

    try {
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