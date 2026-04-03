const jwt = require("jsonwebtoken");
// const tokenModel = require("../models/token.model"); <-- BU QATORNI O'CHIRING (Kerak emas)

class TokenService {
  generateToken(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  }

  // MUHIM: Har bir funksiyaga uchinchi parametr sifatida modelni uzatamiz
  async saveToken(userId, refreshToken, TokenModel) {
    // Endi tepadagi 'tokenModel' emas, argumentdan kelgan 'TokenModel'ni ishlatamiz
    const existToken = await TokenModel.findOne({ user: userId });
    if (existToken) {
      existToken.refreshToken = refreshToken;
      return existToken.save();
    }
    const token = await TokenModel.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken, TokenModel) {
    return await TokenModel.findOneAndDelete({ refreshToken });
  }

  async findToken(refreshToken, TokenModel) {
    return await TokenModel.findOne({ refreshToken });
  }

  validateRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_TOKEN); // JWT_REFRESH_KEY emas, TOKEN bo'lishi kerak sizda tepadagi bilan bir xil
    } catch (error) {
      return null;
    }
  }

  validateAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new TokenService();