require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");

const app = express();

// ------------------ MIDDLEWARES ------------------

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS sozlamalari
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = [
  "safymilk.company-erp.uz"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || !isProd || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Ruxsat etilmagan domen"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));

// --- STATIK FAYLLAR ---
// Public papkasi uchun
app.use(express.static(path.join(__dirname, "public")));

// ✅ MUHIM: Yuklangan mahsulot rasmlarini brauzerda ko'rish uchun 'uploads' papkasini statik qilish
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cookie parser
app.use(cookieParser());

/** * ⚠️ DIQQAT: app.use(fileUpload()) olib tashlandi! 
 * Chunki biz routerda 'multer' ishlatyapmiz. Ikkalasi birga ishlamaydi.
 */

// ------------------ ROUTES ------------------

// Bots
require("./bots/drivers/bot.js");

// Helpers
app.use("/api/v1/helpers", require("./routes/helpers/address/address.route.js"));

// Dashboard
app.use("/api/v1/dashboard/statistics/sale", require("./routes/dashboard/statistics/saleStatistic.route.js"));

// Admin
app.use("/api/v1/admin/permission", require("./routes/admin/permission.route.js"));
app.use("/api/v1/admin/role", require("./routes/admin/role.route.js"));
app.use("/api/v1/admin/user", require("./routes/admin/users.route.js"));

app.use("/api/v1/auth", require("./routes/auth.route.js"));

// HR
app.use("/api/v1/hr/employees", require("./routes/hr/employee/employee.route.js"));

// Drivers
app.use("/api/v1/drivers", require("./routes/drivers/driver.route.js"));

// Customers
app.use("/api/v1/customers", require("./routes/customers/c-managment/managment.route.js"));

// Sale
app.use("/api/v1/sale", require("./routes/sale/orders/order.route.js"));

// ✅ Mahsulotlar (Multer ishlatilgan router)
app.use("/api/v1/sale/products", require("./routes/sale/products/product.route.js"));

app.use("/api/v1/sale/salepos", require("./routes/sale/salepos/salepos.route.js"));

// Warehouses
app.use("/api/v1/warehouses", require("./routes/warehouses/r-warehouse/warehouse.route.js"));
app.use("/api/v1/warehouses/input", require("./routes/warehouses/input/input.route.js"));

// Xatoliklarni ushlash (Barcha routerlardan keyin bo'lishi shart)
app.use(errorMiddleware);

// ------------------ START ------------------
const PORT = process.env.PORT || 5000;

const START = async () => {
  try {
    // DB ulanishi (autoIndex: true qilish tavsiya etiladi, agar indexlar bilan ishlasangiz)
    await mongoose.connect(process.env.DB_URL, { autoIndex: true }); 
    console.log("DB ga ulanish muvaffaqiyatli");

    app.listen(PORT, () => {
    console.log(`🚀 Server ${isProd ? 'SERVERDA (PROD)' : 'LOKALDA (DEV)'} ishga tushdi`);
    console.log(`🔗 Bazaviy URL: ${process.env.BASE_URL}`);
});
  } catch (err) {
    console.error(`❌ DB ga ulanishda xatolik: ${err}`);
    process.exit(1);
  }
};

if (require.main === module) {
    START();
}

module.exports = app;