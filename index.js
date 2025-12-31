require("dotenv").config(); // 1. Har doim birinchi qatorda bo'lishi shart
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");

const app = express();

// ------------------ MUHITNI TEKSHIRISH ------------------
// .trim() probellardan tozalash uchun kerak
const joriyMuhit = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : "development";
const isProd = joriyMuhit === "production";

console.log(`--- TIZIM HOLATI ---`);
console.log(`Joriy NODE_ENV: ${joriyMuhit}`);
console.log(`Rejim: ${isProd ? "SERVERDA (PROD)" : "LOKALDA (DEV)"}`);
console.log(`--------------------`);

// ------------------ MIDDLEWARES ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS sozlamalari
const allowedOrigins = [
  "https://safymilk.company-erp.uz",
  "http://localhost:5173"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Lokal rejimda yoki ruxsat etilgan domen bo'lsa ruxsat berish
    if (!origin || !isProd || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS rad etildi: ${origin}`);
      callback(new Error("CORS: Ruxsat etilmagan domen"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ------------------ ROUTES ------------------
// Bots
require("./bots/drivers/bot.js");

// API Yo'nalishlari
app.use("/api/v1/helpers", require("./routes/helpers/address/address.route.js"));
app.use("/api/v1/dashboard/statistics/sale", require("./routes/dashboard/statistics/saleStatistic.route.js"));
app.use("/api/v1/admin/permission", require("./routes/admin/permission.route.js"));
app.use("/api/v1/admin/role", require("./routes/admin/role.route.js"));
app.use("/api/v1/admin/user", require("./routes/admin/users.route.js"));
app.use("/api/v1/auth", require("./routes/auth.route.js"));
app.use("/api/v1/hr/employees", require("./routes/hr/employee/employee.route.js"));
app.use("/api/v1/drivers", require("./routes/drivers/driver.route.js"));
app.use("/api/v1/customers", require("./routes/customers/c-managment/managment.route.js"));
app.use("/api/v1/sale", require("./routes/sale/orders/order.route.js"));
app.use("/api/v1/sale/products", require("./routes/sale/products/product.route.js"));
app.use("/api/v1/sale/salepos", require("./routes/sale/salepos/salepos.route.js"));
app.use("/api/v1/warehouses", require("./routes/warehouses/r-warehouse/warehouse.route.js"));
app.use("/api/v1/warehouses/input", require("./routes/warehouses/input/input.route.js"));
app.use("/api/v1/supply/counterparty", require("./routes/supply/counterparty/counterparty.route.js"));
app.use("/api/v1/supply/inbound", require("./routes/supply/inbound/inbound.route.js"));
app.use("/api/v1/supply/rawmaterial", require("./routes/supply/rawmaterial/rawmaterial.route.js"));

// Xatoliklarni ushlash
app.use(errorMiddleware);

// ------------------ START ------------------
const PORT = process.env.PORT || 8000;

const START = async () => {
  try {
    // MongoDB ulanishi
    await mongoose.connect(process.env.DB_URL, { 
      autoIndex: true,
      serverSelectionTimeoutMS: 5000 
    }); 
    console.log("✅ DB ga ulanish muvaffaqiyatli");

    app.listen(PORT, () => {
      console.log(`🚀 Server ${isProd ? 'SERVERDA (PROD)' : 'LOKALDA (DEV)'} ishga tushdi`);
      console.log(`🔗 Bazaviy URL: ${process.env.BASE_URL}`);
      console.log(`📡 Port: ${PORT}`);
    });
  } catch (err) {
    console.error(`❌ Xatolik yuz berdi: ${err.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
    START();
}

module.exports = app;