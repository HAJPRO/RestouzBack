require("dotenv").config(); // 1. Har doim birinchi qatorda bo'lishi shart
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { 
        origin: "*", // Agent va Frontend ulanishi uchun hamma yo'nalishga ruxsat
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'] 
  })// Barqaror ulanish uchun });
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");

// JSON ma'lumotlar uchun limitni 10MB ga oshirish (Base64 rasmlar uchun yetarli)
// Limitni oshirish
app.use(express.json({ limit: '10mb' }));

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

// URL-encoded ma'lumotlar uchun ham limitni oshirish
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
    if (!origin || !isProd || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Ruxsat etilmagan domen"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // SHU YERGA 'x-tenant-id'ni QO'SHAMIZ:
  allowedHeaders: [
    'Origin', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'x-tenant-id' // <--- Mana bu juda muhim!
  ]
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ------------------ ROUTES ------------------
// Bots
require("./bots/drivers/bot.js");
const tenantMiddleware = require("./middlewares/db/tenant.middleware.js");
const tenantRouter = express.Router();
tenantRouter.use(tenantMiddleware); // Barcha ichki routelar uchun bazani ulaydi
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

///settings
app.use("/settings/printer/template", require("./routes/settings/printer/pricePrinter.route.js"));

app.use("/api/v1", tenantRouter);
// Xatoliklarni ushlash
app.use(errorMiddleware);

// ------------------ START ------------------
const PORT = process.env.PORT || 8000;

const START = async () => {
  try {
    // 1. Faqat asosiy bazaga ulanish (Bu yerda faqat 'tenants' jadvali bo'ladi)
    await mongoose.connect(process.env.DB_URL); 
    console.log("✅ Asosiy (Control) DB ulandi");

    server.listen(PORT, () => {
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


//

io.on("connection", (socket) => {
    console.log("Yangi socket ulanishi:", socket.id);

    // Har qanday mijoz (Agent yoki Frontend) xonaga kirishi uchun
    socket.on("AGENT:JOIN", (storeId) => {
        socket.join(storeId);
        console.log(`🏠 ROOM-GA KIRILDI: "${storeId}" (Socket: ${socket.id})`);
    });

    socket.on("AGENT:PRINTER_LIST", (data) => {
        const roomName = String(data.storeId); 
    console.log(`🖨️ Printerlar yuborilmoqda. Xona: ${roomName}`,data);
    
    io.to(roomName).emit("FRONTEND:UPDATE_PRINTERS", data.printers);
    });

    socket.on("SERVER:GET_PRINTERS", (data) => {
        console.log(`🔍 Frontend printerlarni so'rayapti: ${data.storeId}`);
        // Agentga so'rovni yuborish
        io.to(data.storeId).emit("SERVER:GET_PRINTERS");
    });

    socket.on("FRONTEND:SEND_PRINT", (data) => {
        console.log(`📄 Chop etish buyrug'i: ${data.storeId}`);
        io.to(data.storeId).emit("SERVER:PRINT_LABEL", data);
    });

    socket.on("AGENT:PRINT_STATUS", (data) => {
        io.to(data.storeId).emit("FRONTEND:PRINT_RESULT", data);
    });
});

module.exports = app;