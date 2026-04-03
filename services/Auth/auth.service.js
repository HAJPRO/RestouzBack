const UserDto = require("../../dtos/user.dto");
const bcrypt = require("bcryptjs");
const tokenService = require("./token.service");
const BaseError = require("../../errors/base.error");

class AuthService {
  /**
   * 📝 Yangi foydalanuvchini ro'yxatdan o'tkazish (Tenant doirasida)
   */
  async register(req, data) {
    const { User, Token } = req.tenantModels;
    const { username, password, companyCode } = data;
    console.log(data)
    // 1. Shu tenant ichida username band emasligini tekshirish
    const existUser = await User.findOne({ username });
    if (existUser) {
      throw BaseError.BadRequest(`Username ${username} allaqachon band!`);
    }

    // 2. Parolni xesh qilish va saqlash
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...data,
      password: hashPassword,
      action: "login_successfully",
      chatId: 1
    });

    const userDto = new UserDto(user);
    // Tokenga companyCode qo'shiladi, shunda keyingi so'rovlarda qaysi bazaga ulanishni bilamiz
    const tokens = tokenService.generateToken({ ...userDto, companyCode });

    await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);

    return { msg: "Foydalanuvchi qo'shildi", user: userDto, ...tokens };
  }

  /**
   * 🔑 Login qilish
   */
  /**
 * Foydalanuvchini tizimga kiritish (Multi-tenant support)
 * @param {Object} req - Request object
 * @param {String} username - Foydalanuvchi nomi
 * @param {String} password - Maxfiy parol
 */
  async login(req, username, password) {
    const { User, Token } = req.tenantModels;
    const { companyCode } = req.body;

    // 1. Model mavjudligini tekshirish (Early Exit)
    if (!User || !Token) {
      throw BaseError.InternalServerError("Ma'lumotlar bazasi bilan ulanishda xatolik (Tenant models missing)");
    }

    // 2. Foydalanuvchini izlash (Faqat kerakli maydonlarni olish orqali performance'ni oshiramiz)
    const user = await User.findOne({ username })
      .populate({
        path: 'roles',
        select: 'name permissions' // Faqat kerakli maydonlarni populate qilish
      })
      .select('+password'); // Agar modelda password: { select: false } bo'lsa

    if (!user) {
      throw BaseError.BadRequest("Foydalanuvchi nomi yoki parol noto'g'ri");
      // Xavfsizlik uchun: "Foydalanuvchi topilmadi" demaslik kerak
    }

    // 3. Parolni tekshirish
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw BaseError.BadRequest("Foydalanuvchi nomi yoki parol noto'g'ri");
    }

    // 4. DTO va Token yaratish
    const userDto = new UserDto(user);

    // Token ichiga ortiqcha ma'lumot qo'shmaslik kerak (Payload hajmi uchun)
    const tokens = tokenService.generateToken({
      id: userDto.id,
      roles: userDto.roles,
      companyCode
    });

    // 5. Refresh tokenni bazaga saqlash
    try {
      await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);
    } catch (error) {
      console.error(`[TokenSaveError]: User ID ${userDto.id}`, error);
      throw BaseError.InternalServerError("Tizimga kirishda texnik xatolik yuz berdi");
    }

    // 6. Natijani qaytarish (Muvaffaqiyatli login)
    return {
      user: userDto,
      ...tokens,
      companyCode,
      loginAt: new Date() // Audit uchun foydali
    };
  }

  /**
   * 🔄 Tokenni yangilash (Refresh)
   */
  async refresh(req, refreshToken) {
    const { User, Token } = req.tenantModels;
    const { companyCode } = req.body; // Yoki tokendan olinadi

    if (!refreshToken) throw BaseError.UnauthorizedError();

    const userPayload = tokenService.validateRefreshToken(refreshToken);
    const tokenDb = await tokenService.findToken(refreshToken, Token);

    if (!userPayload || !tokenDb) {
      throw BaseError.UnauthorizedError("Sessiya muddati tugagan");
    }

    const user = await User.findById(userPayload.id);
    const userDto = new UserDto(user);

    const tokens = tokenService.generateToken({ ...userDto, companyCode });
    await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);

    return { user: userDto, ...tokens };
  }

  /**
   * 📝 Foydalanuvchi ma'lumotlarini tahrirlash
   */
  async update(req, data) {
    const { User } = req.tenantModels;
    await User.findByIdAndUpdate(data.id, data.model, { new: true });
    return { msg: "Muvaffaqiyatli o'zgartirildi" };
  }

  /**
   * 🚪 Tizimdan chiqish
   */
  async logout(req, refreshToken) {
    const { Token } = req.tenantModels;
    return await tokenService.removeToken(refreshToken, Token);
  }

  /**
   * 👥 Barcha foydalanuvchilarni olish
   */
  async getUsers(req) {
    const { User } = req.tenantModels;
    return await User.find().select("-password");
  }
}

module.exports = new AuthService();