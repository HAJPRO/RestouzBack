class FeeService {
  async Create(req) {
    const { Fee } = req.tenantModels;
    const data = req.body;

    try {
      // 1. Bazada avval xizmat foizi kiritilganmi yoki yo'qligini tekshiramiz
      let fee = await Fee.findOne();

      if (fee) {
        // Agar mavjud bo'lsa - yangilaymiz (Update)
        fee.percentage = data.percentage;
        fee.status = data.status; // 'active' yoki 'inactive'
        await fee.save();
        
        return { 
          msg: "Xizmat sozlamalari muvaffaqiyatli yangilandi", 
          data: fee,
          success: true 
        };
      } else {
        // Agar mavjud bo'lmasa - yangi yaratamiz (Create)
        const newFee = new Fee({
          percentage: data.percentage,
          status: data.status
        });
        await newFee.save();

        return { 
          msg: "Xizmat sozlamalari muvaffaqiyatli saqlandi", 
          data: newFee,
          success: true 
        };
      }
    } catch (err) {
      console.error("FeeService Create Error:", err);
      return { msg: "Xatolik yuz berdi", error: err.message, success: false };
    }
  }

  async GetFee(req) {
  const { Fee } = req.tenantModels;

  try {
    // 1. Bazadan bitta hujjatni qidiramiz
    const fee = await Fee.findOne().lean();

    // 2. Agar fee mavjud bo'lsa, o'zini qaytaramiz
    // Agar fee yo'q bo'lsa (null), default obyektni qaytaramiz
    const result = fee ? fee : { percentage: 0, status: 'inactive' };

    // 3. Frontenddagi store.js kutayotgan formatda qaytaramiz
    // Store: response.data.data.data ni o'qiyotgan edi
    return {
      data: result,
      success: true
    };

  } catch (err) {
    console.error("FeeService GetFee Error:", err);
    return { 
      msg: "Xatolik yuz berdi", 
      error: err.message, 
      success: false 
    };
  }
}
}

module.exports = new FeeService();