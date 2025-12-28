const QRCode = require('qrcode');


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

module.exports = { generateQRCode };