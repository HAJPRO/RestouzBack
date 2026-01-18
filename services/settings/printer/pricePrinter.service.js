const Template = require("../../../models/Settings/printer/pricePrinter.model"); // Model yo'li
const path = require('path');
const printer = require("pdf-to-printer");

// Agar PDF yoki rasm ko'rinishida yuklab olish kerak bo'lsa, generaterdan foydalanamiz
const { generatePdfBuffer } = require('../../../utils/generater'); 

class PricePrinterTemplateService {
    
    // 1. Barcha shablonlarni olish (GetAll)
    async GetAllTemplates(query) {
        try {
            const data = await Template.find()
                // .populate("author", "fullname") // Kim yaratganini ko'rish uchun
                .sort({ createdAt: -1 });
            
            return { status: 200, data };
        } catch (error) {
            throw new Error("Shablonlarni yuklashda xatolik: " + error.message);
        }
    }

    // 2. Yangi shablon yaratish (Create)
    async CreateTemplate(payload) {
        try {
            const newTemplate = await Template.create(payload);
            return { status: 201, data: newTemplate };
        } catch (error) {
            throw new Error("Shablon yaratishda xatolik: " + error.message);
        }
    }

    // 3. Shablonni yangilash (Update)
    async UpdateTemplate(id, payload) {
        try {
            const updatedTemplate = await Template.findByIdAndUpdate(
                id, 
                { ...payload, updatedAt: Date.now() }, 
                { new: true, runValidators: true }
            );

            if (!updatedTemplate) {
                throw new Error("Yangilanadigan shablon topilmadi");
            }

            return { status: 200, data: updatedTemplate };
        } catch (error) {
            throw new Error("Yangilashda xatolik: " + error.message);
        }
    }

    // 4. Shablonni o'chirish (Delete)
    async DeleteTemplate(id) {
        try {
            const deleted = await Template.findByIdAndDelete(id);
            if (!deleted) {
                throw new Error("O'chiriladigan shablon topilmadi");
            }
            return { status: 204, message: "Muvaffaqiyatli o'chirildi" };
        } catch (error) {
            throw new Error("O'chirishda xatolik: " + error.message);
        }
    }
    //printer conf

async GetAllPrinter() {
    try {
        // pdf-to-printer kutubxonasi orqali tizim printerlarini olamiz
        const printers = await printer.getPrinters();

        if (!printers || printers.length === 0) {
            return { status: "success", data: [] };
        }

        const printersList = printers.map(p => ({
            label: p.name,       // Printerning nomi
            value: p.name,       // Tanlov uchun ID sifatida
            isDefault: !!p.default, // Standart printermi?
            // pdf-to-printer statusni ham berishi mumkin
            status: p.status || "ready" 
        }));

        return { status: "success",  printersList };

    } catch (error) {
        console.error("pdf-to-printer xatoligi:", error);
        return { 
            status: "error", 
            message: "Printerlarni olishda xatolik yuz berdi",
            data: [] 
        };
    }
}
    async PrintToSelectedDevice(req, res) {
    try {
        const { printerName, templateId, options } = req.body;
        
        // PDF yo'lini aniqlash (bu yerda sizning PDF generatsiya mantiqingiz bo'ladi)
        const pdfPath = `./temp/labels/label_${templateId}.pdf`; 

        const printOptions = {
            printer: printerName, // Frontdan kelgan tanlangan printer
            scale: options.scale || "fit",
            copies: options.copies || 1
        };

        await printer.print(pdfPath, printOptions);
        res.status(200).json({ success: true, message: "Pechatga yuborildi" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

}
// B. Kelgan zapros bo'yicha aniq printerga chop etish


module.exports = new PricePrinterTemplateService();