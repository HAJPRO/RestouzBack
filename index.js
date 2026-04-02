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
        origin: "*", // Mobil ilovalar uchun eng ma'qul yo'l (productionda cheklash mumkin)
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// ------------------ MIDDLEWARES ------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS sozlamalari
const joriyMuhit = (process.env.NODE_ENV || "development").trim();
const isProd = joriyMuhit === "production";

const allowedOrigins = [
    "https://restouz-core.company-erp.uz",
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost",       // Android Capacitor
    "capacitor://localhost"   // iOS Capacitor
];

app.use(cors({
    origin: function (origin, callback) {
        // origin bo'lmasa (masalan mobil app so'rovlari) yoki ro'yxatda bo'lsa ruxsat berish
        if (!origin || allowedOrigins.includes(origin) || !isProd) {
            callback(null, true);
        } else {
            callback(new Error("CORS: Ruxsat etilmagan domen"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'x-tenant-id']
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ------------------ ROUTES ------------------
const tenantRouter = express.Router();
tenantRouter.use(tenantMiddleware);

tenantRouter.use("/admin/permission", require("./routes/admin/permission.route.js"));
tenantRouter.use("/admin/role", require("./routes/admin/role.route.js"));
tenantRouter.use("/admin/user", require("./routes/admin/users.route.js"));
tenantRouter.use("/auth", require("./routes/auth.route.js"));
tenantRouter.use("/tabel", require("./routes/tabel/tabel.route.js"));

app.use("/api/v1", tenantRouter);
app.use(errorMiddleware);

// ------------------ SOCKET.IO LOGIKASI ------------------
io.on("connection", (socket) => {
    console.log("⚡ Yangi ulanish:", socket.id);
    // ... sizning qolgan socket logikangiz ...
});

// ------------------ DATABASE VA SERVER START ------------------
const PORT = process.env.PORT || 5000;

const START = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("✅ MongoDB ulandi");

        server.listen(PORT, () => {
            console.log(`\n--- TIZIM HOLATI ---`);
            console.log(`🌍 Muhit: ${isProd ? "PRODUCTION" : "DEVELOPMENT"}`);
            console.log(`🚀 Port: ${PORT}`);
            console.log(`--------------------\n`);
        });
    } catch (err) {
        console.error(`❌ Xatolik: ${err.message}`);
        process.exit(1);
    }
};

START();