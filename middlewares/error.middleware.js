// middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
  // Debug uchun terminalga xatoni chiqaramiz
  console.error("❌ Backend Xatolik:", err.message);

  // Status kodni tekshirish (Faqat raqam bo'lishi shart)
  let statusCode = 500;
  if (err.statusCode && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  } else if (err.status && typeof err.status === 'number') {
    statusCode = err.status;
  }

  // Express qabul qiladigan diapazonda bo'lishini ta'minlaymiz
  if (statusCode < 100 || statusCode > 599) statusCode = 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Ichki server xatosi"
  });
};