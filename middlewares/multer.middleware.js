const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Papka mavjudligini tekshirish (papkalar bo'lmasa Multer xato beradi)
const uploadDir = 'public/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Faylni saqlash joyi va nomi qoidalari
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Fayllar 'uploads/products/' ichiga tushadi
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Fayl nomini unikal qilish: product-1735231459-987654321.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. Filtrlash va cheklovlar
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB (biznes uchun yetarli)
    fileFilter: (req, file, cb) => {
        // Faqat rasm ekanligini tekshirish (MIME type orqali)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Faqat rasm fayllarini yuklash mumkin!'), false);
        }
    }
});

module.exports = upload;