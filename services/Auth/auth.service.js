const UserDto = require("../../dtos/user.dto");
const bcrypt = require("bcryptjs");
const tokenService = require("./token.service");
const BaseError = require("../../errors/base.error");
const { CentralTenantModel } = require("../../models/CentralDB/config/db"); // Markaziy (Master) baza modeli
const initModels = require("../../models/initModels");
const { getTenantDB } = require("../../middlewares/db/dbManager.middleware");

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

 
 async login(req, username, password) {
    const { companyCode } = req.body;

    // 1. Markaziy bazadan kompaniyani tekshirish
    const tenant = await CentralTenantModel.findOne({ companyCode, isActive: true });
    
    if (!tenant) {
      throw BaseError.BadRequest("Bunday kompaniya tizimda mavjud emas yoki bloklangan!");
    }

    // 2. Haqiqiy kompaniya bazasiga ulanishni hosil qilish
    const db = await getTenantDB(tenant.dbName);
    
    // 3. AYNAN SHU BAZA MODELLARINI OLISH (Mana shu qator muhim!)
    // Avvalgi req.tenantModels ni ishlatmang, u noto'g'ri bazaga bog'langan bo'lishi mumkin
    const { User, Token } = initModels(db); 

    if (!User || !Token) {
      throw BaseError.InternalServerError("Kompaniya bazasiga ulanishda texnik xatolik!");
    }

    // 4. Foydalanuvchini AYNAN SHU kompaniya bazasidan qidirish
   const user = await User.findOne({ username })
  .populate({
    path: 'roles',         // 1-daraja: User modelidagi roles massivini ochish
    model: 'Role',         // Rol modeli nomi
    populate: {
      path: 'permissions', // 2-daraja: Role modeli ichidagi permissions massivini ochish
      model: 'Permission'  // Permission modeli nomi
    }
  })
  .select('+password');    // Yashirilgan parolni olish
    // ... (qolgan parolni tekshirish va token yaratish qismi bir xil)
    console.log(user)
    if (!user) {
      throw BaseError.BadRequest("Foydalanuvchi nomi yoki parol noto'g'ri");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw BaseError.BadRequest("Foydalanuvchi nomi yoki parol noto'g'ri");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({
      id: userDto.id,
      roles: userDto.roles,
      companyCode: tenant.companyCode,
    });
console.log(userDto)

    await tokenService.saveToken(userDto.id, tokens.refreshToken, Token);

    return {
      user: userDto,
      ...tokens,
      companyCode: tenant.companyCode,
      loginAt: new Date()
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