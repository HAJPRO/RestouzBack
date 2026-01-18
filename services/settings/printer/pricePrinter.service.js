const Template = require("../../../models/Settings/printer/pricePrinter.model"); // Model yo'li
const path = require("path");
const printer = require("pdf-to-printer");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const os = require("os");
// Agar PDF yoki rasm ko'rinishida yuklab olish kerak bo'lsa, generaterdan foydalanamiz
const { generatePdfBuffer } = require("../../../utils/generater");

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
        { new: true, runValidators: true },
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

      const printersList = printers.map((p) => ({
        label: p.name, // Printerning nomi
        value: p.name, // Tanlov uchun ID sifatida
        isDefault: !!p.default, // Standart printermi?
        // pdf-to-printer statusni ham berishi mumkin
        status: p.status || "ready",
      }));

      return { status: "success", printersList };
    } catch (error) {
      console.error("pdf-to-printer xatoligi:", error);
      return {
        status: "error",
        message: "Printerlarni olishda xatolik yuz berdi",
        data: [],
      };
    }
  }
 
async sendToPrintBulk(payload) {
  const { templateId, items, settings } = payload;
  try {
    const template = await Template.findById(templateId);
    if (!template) return { success: false, message: "Shablon topilmadi" };

    const PRINTER_NAME = "P1 Label Printer";
    // Standart 203 DPI printer: 1mm = 7.99~8 dots. 
    // 300 DPI printer bo'lsa, 11.81 deb oling.
    const SCALE = 3.78; 

    const canvasWidth = template.width * SCALE;  
    const canvasHeight = template.height * SCALE;

    for (const item of items) {
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      // 1. Fon oq, rasm aniq (Antialiasing o'chirilgan)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.imageSmoothingEnabled = false; 

      for (const el of template.elements) {
        ctx.fillStyle = "#000000";
        let content = this._parseContent(el, item, settings);

        const x = el.x * SCALE;
        const y = el.y * SCALE;
        const w = (el.w || 5) * SCALE;
        const h = (el.h || 5) * SCALE;

        if (el.type === 'qr' || el.type === 'barcode') {
          let codeData = el.type === 'qr' ? item.qr : item.barcode;
          if (codeData) {
            if (!codeData.startsWith('data:image')) codeData = `data:image/png;base64,${codeData}`;
            const img = await loadImage(codeData);
            // Elementning belgilangan eni va bo'yiga (w, h) qarab chizish
            ctx.drawImage(img, x, y, w, h);
          }
        } else if (content) {
          const fontSizePx = (el.fontSize || 3) * SCALE;
          ctx.font = `bold ${fontSizePx}px Arial`;
          ctx.textBaseline = 'top';
          // Matnni cheklangan eni (w) bo'yicha chizish
          ctx.fillText(content, x, y, w);
        }
      }

      const buffer = canvas.toBuffer('image/png');
      const tempPath = path.join(os.tmpdir(), `label_${Date.now()}.png`);
      fs.writeFileSync(tempPath, buffer);

      try {
        const printCopies = item.quantity || 1;
        await printer.print(tempPath, {
          printer: PRINTER_NAME,
          win32: [
            "-print-settings", `noscale,copies=${printCopies}`,
            // Qog'oz o'lchamini drayver nomi bilan bir xil yozish kerak
            `-o media=40x30mm`, 
            "-o orientation-requested=3" // 3-Portrait, 4-Landscape
          ]
        });
      } catch (e) {
        console.error("Print Error:", e.message);
      } finally {
        setTimeout(() => { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); }, 3000);
      }
    }
    return { success: true, message: "Pechatga yuborildi" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

  _parseContent(el, item, settings) {
    switch (el.type) {
      case 'name': return item.name;
      case 'price': return `${item.price?.toLocaleString()} ${settings.currency || 'SUM'}`;
      case 'fullname': return item.fullname || item.name;
      default: return el.value || '';
    }
  }
}
// B. Kelgan zapros bo'yicha aniq printerga chop etish

module.exports = new PricePrinterTemplateService();
