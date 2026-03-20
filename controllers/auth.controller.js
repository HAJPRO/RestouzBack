const BaseError = require("../errors/base.error");
const authService = require("../services/auth.service");
// const { validationResult } = require("express-validator");

class AuthController {
  async register(req, res, next) {
    try {

      const data = await authService.register(req,req.body);
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
async login(req, res, next) {
  try {
    const { username, password } = req.body;
    
    // MUHIM: Servicega 'req' obyektini uzatish kerak
    const data = await authService.login(req, username, password); 

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      // isProd ? { sameSite: 'none', secure: true } : {} // Agar HTTPS bo'lsa kerak bo'ladi
    });

    return res.json(data); // Mana shu javob Front-endga boradi
  } catch (error) {
    next(error);
  }
}
  async update(req, res, next) {
    try {
      const data = await authService.update(req,req.body);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
  async activation(req, res, next) {
    try {
      const userId = req.params.id;
      await authService.activation(req,userId);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await authService.logout(req,refreshToken);
      res.clearCookie("refreshToken");
      return res.json({ token });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const data = await authService.refresh(req,refreshToken);
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
      const data = await authService.getUsers(req);
      return res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
