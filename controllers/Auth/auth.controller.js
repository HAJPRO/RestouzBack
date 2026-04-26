const BaseError = require("../../errors/base.error");
const {AuthService} = require("../../services/index.service");


class AuthController {
  async register(req, res, next) {
    try {

      const data = await AuthService.register(req, req.body);
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
  /**
 * Login Controller - Foydalanuvchi kirishini boshqarish
 */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // 1. Service qatlamiga murojaat
      // 'req' obyektini uzatish orqali Service ichida tenantModels'dan foydalanish mumkin
      const userData = await AuthService.login(req, username, password);

      // 2. Cookie sozlamalari (Security Hardening)
      const isProd = process.env.NODE_ENV === 'production';

      res.cookie("refreshToken", userData.refreshToken, {
        httpOnly: true,    // JavaScript orqali o'g'irlashni oldini oladi (XSS protection)
        secure: isProd,    // Faqat HTTPS orqali yuboriladi
        sameSite: isProd ? 'none' : 'lax', // Cross-site request forgery (CSRF) himoyasi
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
        path: '/',         // Hamma endpointlar uchun amal qiladi
      });

      // 3. Front-endga javob qaytarish
      // Refresh tokenni JSON ichida qaytarmaslik xavfsizlik nuqtai nazaridan yaxshiroq
      const { refreshToken, ...clientData } = userData;

      return res.status(200).json({
        success: true,
        message: "Tizimga muvaffaqiyatli kirildi",
        data: clientData // User, AccessToken va boshqa ma'lumotlar
      });

    } catch (error) {
      // 4. Xatolikni markazlashgan error-handler'ga uzatish
      console.error(`[LoginController Error]: ${new Date().toISOString()}`, error);
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      const data = await AuthService.update(req, req.body);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
  async activation(req, res, next) {
    try {
      const userId = req.params.id;
      await AuthService.activation(req, userId);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await AuthService.logout(req, refreshToken);
      res.clearCookie("refreshToken");
      return res.json({ token });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const data = await AuthService.refresh(req, refreshToken);
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const data = await AuthService.getUsers(req);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
