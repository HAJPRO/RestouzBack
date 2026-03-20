const UserDto = require("../dtos/user.dto");
const bcrypt = require("bcryptjs");
const tokenService = require("../services/token.service");
const BaseError = require("../errors/base.error");

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
  async login(req, username, password) {
    const { User, Token } = req.tenantModels;
    console.log(User);
    
    const { companyCode } = req.body;

    if (!User || !Token) {
      throw BaseError.BadRequest("Tenant modellari yuklanmadi");
    }

    const user = await User.findOne({ username }).populate('roles');
    if (!user) throw BaseError.BadRequest("Foydalanuvchi topilmadi");

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) throw BaseError.BadRequest("Parol noto'g'ri");

    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({ ...userDto, companyCode });

    await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);

    return { user: userDto, ...tokens, companyCode };
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