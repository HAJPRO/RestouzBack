require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorMiddleware = require("./middlewares/error.middleware.js");
const tenantMiddleware = require("./middlewares/db/tenant.middleware.js");
const { centralDbConnection } = require("./models/CentralDB/config/db.js");

const app = express();
const server = http.createServer(app);

// ------------------ 1. CORS SOZLAMALARI (Routerlardan tepada bo'lishi shart) ------------------
const allowedOrigins = [
    "http://localhost:5173",   // Vite (Frontend)
    "http://localhost:5000",   // Backend porti
    "https://restouz-core.company-erp.uz",
    "capacitor://localhost",   // Mobile iOS
    "http://localhost"         // Mobile Android
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("⚠️ CORS Bloklandi. Origin:", origin);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id']
}));

// ------------------ 2. BASIC MIDDLEWARES ------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ------------------ 3. SOCKET.IO SOZLAMALARI ------------------
const io = new Server(server, {
    cors: {
        origin: "*", // Yoki allowedOrigins ni bering
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

io.on("connection", (socket) => {
    console.log("⚡ Yangi socket ulanishi:", socket.id);
});

// ------------------ 4. ROUTES (TARTIB MUHIM!) ------------------

/**
 * ⚠️ MUHIM: Auth route tenantMiddleware'dan tashqarida bo'lishi kerak.
 * Chunki login vaqtida x-tenant-id headeri hali bo'lmasligi mumkin.
 * Login ichida Master DB orqali o'zimiz ulanishni o'rnatamiz.
 */
app.use("/api/v1/auth", require("./routes/auth/auth.route.js"));

// Barcha tenantga tegishli yo'nalishlar uchun umumiy router
const tenantRouter = express.Router();
tenantRouter.use(tenantMiddleware); // Har bir so'rovda x-tenant-id headerini tekshiradi

// Tenant yo'nalishlari (Dinamik bazaga ulanadigan route'lar)
tenantRouter.use("/settings/permission", require("./routes/settings/permission/permission.route.js"));
tenantRouter.use("/settings/role", require("./routes/settings/role/role.route.js"));
tenantRouter.use("/settings", require("./routes/settings/users/user.route.js"));
tenantRouter.use("/tabel", require("./routes/tabel/tabel.route.js"));
tenantRouter.use("/menu", require("./routes/menu/menu.route.js"));
tenantRouter.use("/order", require("./routes/order/order.route.js"));
tenantRouter.use("/hr/employee", require("./routes/hr/employee/employee.route.js"));

// Tenant routerni asosiy app ga ulash
app.use("/api/v1", tenantRouter);

// ------------------ 5. ERROR HANDLING ------------------
// Xatoliklarni ushlash routerlardan keyin bo'lishi shart
app.use(errorMiddleware);

// ------------------ 6. DATABASE VA SERVER START ------------------
const PORT = process.env.PORT || 5000;

const START = async () => {
    try {
        // Markaziy baza ulanishini kuzatish
        centralDbConnection.on('connected', () => {
            console.log(`✅ [MASTER] Central DB connected successfully`);
        });

        centralDbConnection.on('error', (err) => {
            console.error(`❌ [MASTER] Central DB connection error:`, err);
            process.exit(1); 
        });

        // Serverni ishga tushirish
        server.listen(PORT, '0.0.0.0', () => {
            const env = (process.env.NODE_ENV || 'development').trim().toUpperCase();
            console.log(`\n--- RESTO.UZ TIZIM HOLATI ---`);
            console.log(`🌍 MUHIT: ${env}`);
            console.log(`🚀 PORT: ${PORT}`);
            console.log(`📦 MASTER DB: Connected`);
            console.log(`------------------------------\n`);
        });

    } catch (err) {
        console.error("❌ START xatosi:", err.message);
        process.exit(1);
    }
};

START();