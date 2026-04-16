const bcrypt = require("bcryptjs");

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
 /**
 * Foydalanuvchilar ro'yxatini olish (Filtrlash va Pagination bilan)
 */
async GetUsers(req) {
  const { User } = req.tenantModels;
  try {
    // 1. Query parametrlarini olish (Front-enddan keladigan filterlar)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const roleId = req.query.roleId || null;

    // 2. Dinamik Query (Filtr) yaratish
    const query = { isActive: true }; // Faqat o'chirilmagan foydalanuvchilar

    // Qidiruv mantiqi (FIO, Username yoki Telefon bo'yicha)
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } }
      ];
    }

    // Rol bo'yicha filtr (Agar tanlangan bo'lsa)
    if (roleId) {
      query.roles = roleId;
    }

    // 3. Ma'lumotlarni bazadan olish
    const users = await User.find(query)
      .select("-password -__v") // Parol va versiyani chiqarmaymiz
     .populate({
    path: "roles",
    populate: {
      path: "permissions" // Mana bu joy permissionlarni ichini ochib beradi
    }
  })
      .sort({ createdAt: -1 }) // Oxirgi qo'shilganlar yuqorida
      .skip((page - 1) * limit) // Kerakli sahifaga sakrash
      .limit(limit) // Sahifadagi elementlar soni
      .lean(); // Mongoose obyektini oddiy JSONga aylantiradi (tezroq ishlaydi)

    // 4. Jami natijalar sonini hisoblash (Frontendda pagination yasash uchun)
    const totalCount = await User.countDocuments(query);

    return {
      success: true,
      status: 200,
      msg: "Foydalanuvchilar muvaffaqiyatli yuklandi",
      data: users,
      pagination: {
        total: totalCount,
        currentPage: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };

  } catch (error) {
    console.error("GET_USERS_ERROR:", error);
    return {
      success: false,
      status: 500,
      msg: "Foydalanuvchilarni yuklashda xatolik yuz berdi",
      error: error.message
    };
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