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

// ------------------ SOCKET.IO SOZLAMALARI ------------------
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// ------------------ MIDDLEWARES ------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// Admin yo'nalishlari
tenantRouter.use("/admin/permission", require("./routes/admin/permission.route.js"));
tenantRouter.use("/admin/role", require("./routes/admin/role.route.js"));
tenantRouter.use("/admin/user", require("./routes/admin/users.route.js"));

// Umumiy yo'nalishlar
tenantRouter.use("/auth", require("./routes/auth/auth.route.js"));
tenantRouter.use("/tabel", require("./routes/tabel/tabel.route.js"));

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
        // MongoDB ulanishi
        await mongoose.connect(process.env.DB_URL);
        console.log("✅ MongoDB muvaffaqiyatli ulandi");

        // Serverni barcha interfeyslarda (0.0.0.0) ishga tushirish
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`\n--- TIZIM HOLATI ---`);
            console.log(`🌍 Muhit: ${joriyMuhit.toUpperCase()}`);
            console.log(`🚀 Port: ${PORT}`);
            console.log(`🔗 URL: https://restouz-core.company-erp.uz`);
            console.log(`--------------------\n`);
        });
    } catch (err) {
        console.error(`❌ Serverni ishga tushirishda xatolik: ${err.message}`);
        process.exit(1);
    }
};

START();