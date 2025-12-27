// bot.js
require("dotenv").config(); // Eslatma: Faylning eng boshida bo‘lsin

const TG_BOT = require("node-telegram-bot-api");
const TG_TOKEN_ORDER = process.env.TG_TOKEN_ORDER;

if (!TG_TOKEN_ORDER) {
  console.error("❌ TG_TOKEN_ORDER aniqlanmadi! .env faylni tekshiring.");
  process.exit(1);
}
const isProd = process.env.NODE_ENV === "production"; // yoki boshqa flag u7w7w
const bot = new TG_BOT(TG_TOKEN_ORDER, { polling: true });

// Polling error handler
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.code, error.message);
});

module.exports = { bot };

// Listener fayllarni yuklash
require("../drivers/message");
require("../drivers/query");
