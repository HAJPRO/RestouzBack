const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

const generateQRCode = async (text, options = {}) => {
  try {
    if (!text) return "";

    // Default sozlamalar
    const defaultOptions = {
      errorCorrectionLevel: 'H', // Yuqori darajadagi xatolikni tuzatish
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000', // QR kod rangi
        light: '#ffffff' // Fon rangi
      },
      ...options // Tashqaridan kelgan sozlamalar defaultni ustidan yozadi
    };

    const qrBase64 = await QRCode.toDataURL(text.toString(), defaultOptions);
    return qrBase64;
  } catch (err) {
    console.error('QR Code Generation Error:', err);
    return "";
  }
};


const generatePdfBuffer = async (templatePath, data) => {
    try {
        // 1. EJS shablonni ma'lumotlar bilan birlashtirib HTML yaratish
        const html = await ejs.renderFile(templatePath, data);

        // 2. Puppeteer-ni ishga tushirish (minimal resurs sarfi bilan)
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
        });

        const page = await browser.newPage();

        // 3. HTML tarkibini sahifaga yuklash
        await page.setContent(html, { 
            waitUntil: 'networkidle0' // barcha resurslar (rasm, CSS) yuklanishini kutadi
        });

        // 4. Professional PDF sozlamalari
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // CSS ranglari va rasmlarni chiqarish uchun shart
            margin: {
                top: '15mm',
                right: '10mm',
                bottom: '15mm',
                left: '10mm'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: true
        });

        await browser.close();
        return pdfBuffer;

    } catch (error) {
        console.error("PDF generatsiya xatosi:", error);
        throw new Error("PDF yaratish jarayonida muammo yuz berdi");
    }
};


const sendPdfResponse = (res, buffer, fileName = 'report') => {
    if (!Buffer.isBuffer(buffer)) {
        buffer = Buffer.from(buffer);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
    
    return res.send(buffer);
};



module.exports = { generateQRCode,generatePdfBuffer,sendPdfResponse };