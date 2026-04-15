require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const mongoose = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");
const tenantMiddleware = require("./middlewares/db/tenant.middleware.js");

const app = express();
const server = http.createServer(app);
// ------------------ MIDDLEWARES ------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ------------------ SOCKET.IO SOZLAMALARI ------------------
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});



// CORS sozlamalari - Mobil ilovalar uchun optimallashtirilgan
const allowedOrigins = [
    "https://restouz-core.company-erp.uz",
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost",       // Android/Web HTTP
    "https://localhost",      // 👈 SHUNI QO'SHING (iOS yoki ba'zi yangi Android WebView uchun)
    "capacitor://localhost",  // iOS Capacitor
    "http://localhost:8100"
];

app.use(cors({
    origin: function (origin, callback) {
        // MUHIM: Mobil ilovalar (Capacitor) ba'zan origin yubormaydi (!origin)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Qaysi domen bloklanayotganini terminalda ko'rish uchun:
            console.log("⚠️ CORS Bloklandi. Origin:", origin);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'x-tenant-id' // Maxsus header ruxsati
    ]
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ------------------ ROUTES ------------------
const tenantRouter = express.Router();
tenantRouter.use(tenantMiddleware);

// Settings yo'nalishlari
tenantRouter.use("/settings/permission", require("./routes/settings/permission/permission.route.js"));
tenantRouter.use("/settings/role", require("./routes/settings/role/role.route.js"));
tenantRouter.use("/settings", require("./routes/settings/users/user.route.js"));

// Umumiy yo'nalishlar
tenantRouter.use("/auth", require("./routes/auth/auth.route.js"));
tenantRouter.use("/tabel", require("./routes/tabel/tabel.route.js"));
tenantRouter.use("/menu", require("./routes/menu/menu.route.js"));
tenantRouter.use("/order", require("./routes/order/order.route.js"));

app.use("/api/v1", tenantRouter);

// Xatoliklarni ushlash (Routerlardan keyin bo'lishi shart)
app.use(errorMiddleware);

// ------------------ SOCKET.IO LOGIKASI ----------------
io.on("connection", (socket) => {
    console.log("⚡ Yangi socket ulanishi:", socket.id);
});

// ------------------ DATABASE VA SERVER START ------------------
const PORT = process.env.PORT || 5000;
const joriyMuhit = (process.env.NODE_ENV || "development").trim();

const START = async () => {
    try {
        const env = (process.env.NODE_ENV || 'development').trim().toLowerCase();
        const isProd = env === 'production';

        // Faqat serverni ishga tushiramiz, ulanishlar esa dinamik bo'ladi
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`\n--- RESTO.UZ TIZIM HOLATI ---`);
            console.log(`🌍 MUHIT: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
            console.log(`🚀 PORT: ${PORT}`);
            console.log(`🔗 DB REJIM: Dinamik Multi-tenant`);
            console.log(`------------------------------\n`);
        });

    } catch (err) {
        console.error(`❌ Serverni ishga tushirishda xatolik: ${err.message}`);
        process.exit(1);
    }
};

START();