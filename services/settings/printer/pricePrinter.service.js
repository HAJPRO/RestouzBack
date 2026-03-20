const path = require("path");
const printer = require("pdf-to-printer");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const os = require("os");

class PricePrinterTemplateService {
  // 1. Barcha shablonlarni olish (Tenantga moslangan)
  async GetAllTemplates(req) {
    const { PricePrinterModel } = req.tenantModels;
    try {
      const data = await PricePrinterModel.find()
        .populate("author", "fullname")
        .sort({ createdAt: -1 })
        .lean();

      return { status: 200, data };
    } catch (error) {
      throw new Error("Shablonlarni yuklashda xatolik: " + error.message);
    }
  }

  // 2. Yangi shablon yaratish
  async CreateTemplate(req, payload) {
    const { PricePrinterModel } = req.tenantModels;
    try {
      const newTemplate = await PricePrinterModel.create({
        ...payload,
        author: req.user?._id // Yaratuvchini avtomatik biriktirish
      });
      return { status: 201, data: newTemplate };
    } catch (error) {
      throw new Error("Shablon yaratishda xatolik: " + error.message);
    }
  }

  // 3. Shablonni yangilash
  async UpdateTemplate(req, id, payload) {
    const { PricePrinterModel } = req.tenantModels;
    try {
      const updatedTemplate = await PricePrinterModel.findByIdAndUpdate(
        id,
        { ...payload, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!updatedTemplate) throw new Error("Shablon topilmadi");

      return { status: 200, data: updatedTemplate };
    } catch (error) {
      throw new Error("Yangilashda xatolik: " + error.message);
    }
  }

  // 4. Shablonni o'chirish
  async DeleteTemplate(req, id) {
    const { PricePrinterModel } = req.tenantModels;
    try {
      const deleted = await PricePrinterModel.findByIdAndDelete(id);
      if (!deleted) throw new Error("O'chiriladigan shablon topilmadi");
      return { status: 204, message: "Muvaffaqiyatli o'chirildi" };
    } catch (error) {
      throw new Error("O'chirishda xatolik: " + error.message);
    }
  }

  // 5. Tizimdagi printerlarni aniqlash
  async GetAllPrinter() {
    try {
      const printers = await printer.getPrinters();
      if (!printers || printers.length === 0) return { status: "success", printersList: [] };

      const printersList = printers.map((p) => ({
        label: p.name,
        value: p.name,
        isDefault: !!p.default,
        status: p.status || "ready",
      }));

      return { status: "success", printersList };
    } catch (error) {
      return { status: "error", message: error.message, printersList: [] };
    }
  }

  // 6. Bulk (Ommaviy) chop etish mantiqi
  async sendToPrintBulk(req, payload) {
    const { PricePrinterModel } = req.tenantModels;
    const { templateId, items, settings } = payload;

    try {
      const template = await PricePrinterModel.findById(templateId);
      if (!template) return { success: false, message: "Shablon topilmadi" };

      // Printer nomi settingsdan yoki standartdan olinadi
      const PRINTER_NAME = settings.printerName || "P1 Label Printer";
      const SCALE = 3.78; // 1mm to px (96 DPI)

      const canvasWidth = template.width * SCALE;
      const canvasHeight = template.height * SCALE;

      for (const item of items) {
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Fonni tayyorlash (Termal printerlar uchun oq-qora kontrast muhim)
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
              ctx.drawImage(img, x, y, w, h);
            }
          } else if (content) {
            const fontSizePx = (el.fontSize || 3) * SCALE;
            ctx.font = `bold ${fontSizePx}px Arial`;
            ctx.textBaseline = 'top';
            
            // Matn uzun bo'lsa, avtomatik keyingi qatorga o'tish (Wrap text) mantiqi
            this._wrapText(ctx, content, x, y, w, fontSizePx);
          }
        }

        const buffer = canvas.toBuffer('image/png');
        const tempPath = path.join(os.tmpdir(), `label_${Date.now()}_${Math.random()}.png`);
        fs.writeFileSync(tempPath, buffer);

        try {
          const printCopies = item.quantity || 1;
          await printer.print(tempPath, {
            printer: PRINTER_NAME,
            win32: [
              "-print-settings", `noscale,copies=${printCopies}`,
              `-o media=Custom.${template.width}x${template.height}mm`,
              "-o orientation-requested=3" 
            ]
          });
        } catch (e) {
          console.error("Print spooler error:", e.message);
        } finally {
          // Faylni o'chirish (vaqtinchalik fayllar to'planib qolmasligi uchun)
          setTimeout(() => { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); }, 5000);
        }
      }
      return { success: true, message: "Barcha etiketkalar chop etishga yuborildi" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Matn mazmunini aniqlash
  _parseContent(el, item, settings) {
    switch (el.type) {
      case 'name': return item.name || item.fullname;
      case 'price': return `${item.price?.toLocaleString()} ${settings.currency || 'SUM'}`;
      case 'code': return item.code || '';
      case 'brand': return item.brand || '';
      default: return el.value || '';
    }
  }

  // Matnni cheklangan eni bo'yicha qatorlarga bo'lish (Helper)
  _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, testY);
        line = words[n] + ' ';
        testY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, testY);
  }
}

module.exports = new PricePrinterTemplateService();