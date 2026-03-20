const bcrypt = require("bcryptjs");

// ❌ Statik importlar o'chirildi: const UserModel = require("../../models/user.model");

class UserService {
  /**
   * Foydalanuvchi yaratish
   */
  async CreateUser(req, data) {
    const { User } = req.tenantModels; // ✅ Dinamik model
    try {
      const { username, department, password, role, permissions, actions, companyCode } = data;

      const isExists = await User.findOne({ username });
      if (isExists) {
        return { success: false, msg: "Username allaqachon mavjud" };
      }

      // Admin yaratishni cheklash (1000 - admin roli deb hisoblasak)
      if (role && role == 1000) {
        return { success: false, msg: "Admin yaratish huquqingiz yo'q!" };
      }

      const hashPassword = await bcrypt.hash(password, 10);
      
      const newUser = await User.create({
        username,
        password: hashPassword,
        department,
        role,
        permissions,
        actions,
        companyCode // Tenant bazasida ham saqlash foydali bo'lishi mumkin
      });

      return {
        success: true,
        msg: "Foydalanuvchi muvaffaqiyatli yaratildi!",
        data: newUser,
      };
    } catch (err) {
      return { success: false, msg: "Xatolik yuz berdi", error: err.message };
    }
  }

  /**
   * Foydalanuvchi ma'lumotlarini yangilash
   */
  async UpdateUser(req, data) {
    const { User } = req.tenantModels;
    try {
      const { _id, username, department, role, permissions, actions, companyCode } = data;

      if (role && role == 1000) {
        return { success: false, msg: "Admin ma'lumotlarini o'zgartira olmaysiz!" };
      }

      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { username, department, role, permissions, actions, companyCode },
        { new: true }
      );

      if (!updatedUser) {
        return { success: false, msg: "Foydalanuvchi topilmadi" };
      }

      return {
        success: true,
        msg: "Foydalanuvchi muvaffaqiyatli yangilandi!",
        data: updatedUser,
      };
    } catch (err) {
      return { success: false, msg: "Yangilashda xatolik", error: err.message };
    }
  }

  /**
   * Barcha foydalanuvchilarni olish
   */
  async GetUsers(req) {
    const { User } = req.tenantModels;
    try {
      // Parolni chiqarmaslik uchun .select("-password") ishlatish tavsiya etiladi
      const users = await User.find().select("-password").lean();
      return users;
    } catch (error) {
      return { error: true, msg: error.message };
    }
  }

  /**
   * Bitta foydalanuvchini ID orqali olish
   */
  async GetOneUser(req, data) {
    const { User } = req.tenantModels;
    try {
      // 'roles' emas 'role' bo'lishi mumkin (sxemangizga qarang)
      const user = await User.findById(data.id).populate('role').populate('permissions');
      return user;
    } catch (error) {
      return { error: true, msg: error.message };
    }
  }

  /**
   * Rollarni olish
   */
  async GetRoles(req) {
    const { Role } = req.tenantModels;
    try {
      const roles = await Role.find().lean();
      return roles;
    } catch (error) {
      return { error: true, msg: error.message };
    }
  }

  /**
   * Ruxsatnomalarni olish
   */
  async GetPermissions(req) {
    const { Permission } = req.tenantModels;
    try {
      const permissions = await Permission.find().lean();
      return permissions;
    } catch (error) {
      return { error: true, msg: error.message };
    }
  }
}

module.exports = new UserService();