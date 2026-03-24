require("dotenv").config();
const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");

const app = express();

// ------------------ JSON LIMITLAR ------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Hajm oshib ketganda xatoni JSON formatda qaytarish
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      status: "413",
      msg: "Yuborilgan rasm hajmi juda katta! Maksimal limit: 10MB"
    });
  }
  next();
});

// ------------------ MUHITNI TEKSHIRISH ------------------
const joriyMuhit = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : "development";
const isProd = joriyMuhit === "production";

console.log(`--- TIZIM HOLATI ---`);
console.log(`Joriy NODE_ENV: ${joriyMuhit}`);
console.log(`Rejim: ${isProd ? "SERVERDA (PROD)" : "LOKALDA (DEV)"}`);
console.log(`--------------------`);

// ------------------ MIDDLEWARES ------------------
const allowedOrigins = [
  "https://safymilk.company-erp.uz",
  "http://localhost:5173"
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
  allowedHeaders: [
    'Origin', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'x-tenant-id' 
  ]
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ------------------ ROUTES ------------------
require("./bots/drivers/bot.js"); // Botni ulash

const tenantMiddleware = require("./middlewares/db/tenant.middleware.js");
const tenantRouter = express.Router();

tenantRouter.use(tenantMiddleware);

// API Yo'nalishlari
tenantRouter.use("/helpers", require("./routes/helpers/address/address.route.js"));
tenantRouter.use("/dashboard/statistics/sale", require("./routes/dashboard/statistics/saleStatistic.route.js"));
tenantRouter.use("/admin/permission", require("./routes/admin/permission.route.js"));
tenantRouter.use("/admin/role", require("./routes/admin/role.route.js"));
tenantRouter.use("/admin/user", require("./routes/admin/users.route.js"));
tenantRouter.use("/auth", require("./routes/auth.route.js"));
tenantRouter.use("/hr/employees", require("./routes/hr/employee/employee.route.js"));
tenantRouter.use("/drivers", require("./routes/drivers/driver.route.js"));
tenantRouter.use("/customers", require("./routes/customers/c-managment/managment.route.js"));
tenantRouter.use("/sale", require("./routes/sale/orders/order.route.js"));
tenantRouter.use("/sale/products", require("./routes/sale/products/product.route.js"));
tenantRouter.use("/sale/salepos", require("./routes/sale/salepos/salepos.route.js"));
tenantRouter.use("/warehouses", require("./routes/warehouses/r-warehouse/warehouse.route.js"));
tenantRouter.use("/warehouses/input", require("./routes/warehouses/input/input.route.js"));
tenantRouter.use("/supply/counterparty", require("./routes/supply/counterparty/counterparty.route.js"));
tenantRouter.use("/supply/inbound", require("./routes/supply/inbound/inbound.route.js"));
tenantRouter.use("/supply/rawmaterial", require("./routes/supply/rawmaterial/rawmaterial.route.js"));
tenantRouter.use("/supply/accessories", require("./routes/supply/accessories/accessory.route.js"));
tenantRouter.use("/supply/accessories/inbound", require("./routes/supply/accessories/inputinbound.route.js"));
tenantRouter.use("/laboratory/analitic", require("./routes/laboratory/analitic/analitic.route.js"));

// Settings
app.use("/settings/printer/template", require("./routes/settings/printer/pricePrinter.route.js"));

app.use("/api/v1", tenantRouter);

// Xatoliklarni ushlash
app.use(errorMiddleware);

// ------------------ START ------------------
const PORT = process.env.PORT || 8000;

const START = async () => {
  try {
    await mongoose.connect(process.env.DB_URL); 
    console.log("✅ Asosiy (Control) DB ulandi");

    // Endi server.listen emas, app.listen ishlatiladi (Soketsiz)
    app.listen(PORT, () => {
      console.log(`🚀 Multi-tenant Backend ${PORT}-portda ishga tushdi`);
    });
  } catch (err) {
    console.error(`❌ Xatolik: ${err.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
    START();
}

module.exports = app;