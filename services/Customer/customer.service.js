const BaseError = require("../../errors/base.error");

class CustomerService {
 async Create(req) {
    const { Customer } = req.tenantModels;
    
    // 1. Body mavjudligini tekshirish
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
    }

    // 2. Ma'lumotlarni destruktizatsiya qilish
    // Frontend'dan 'action' va '_id' keladi, qolganlari modelData ichida qoladi
    const { _id,action, ...modelData } = req.body;

    // 3. Yaratish (Create) mantiqi
    if (action === 'create') {
        // Rasm borligini tekshirish (agar majburiy bo'lsa)
        if (!modelData.image) {
            throw new BaseError("Xodim rasmi yuklanishi shart", 400);
        }

        const data = await Customer.create(modelData);
        return data
    } 

    // 4. Tahrirlash (Edit) mantiqi
    if (action === 'edit') {
        if (!_id) {
            throw new BaseError("Tahrirlash uchun xodim ID si topilmadi", 400);
        }

        // Parol tahrirlanayotgan bo'lsa, uni hash qilish kerak (agar modelda pre-save bo'lmasa)
        // Shuningdek _id ni modelData ichidan olib tashlaymiz (bazada o'zgarmasligi uchun)
        const updated = await Customer.findByIdAndUpdate(
            _id, 
            { $set: modelData }, 
            { new: true, runValidators: true } // runValidators: modeldagi qoidalarni tekshiradi
        );

        if (!updated) {
            throw new BaseError("Bunday ID li xodim topilmadi", 404);
        }

        return { 
            msg: "Ma'lumotlar muvaffaqiyatli yangilandi", 
            data: updated 
        };
    }

    // 5. Noma'lum action bo'lsa
    throw new BaseError(`Noto'g'ri operatsiya: ${action}`, 400);
}
     async GetAll(req) {
    const { Customer } = req.tenantModels;

    // Menu modelidagi 'bookings' maydonini populate qilamiz
    const data = await Customer.find().lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun

    return { 
        success: true,
        msg: "Barcha mijozlar ", 
        data 
    };
}
     async GetById(req) {
    const { Customer } = req.tenantModels;
    const data = await Customer.findById(req.params.id)
        .populate('bookings') // 'bookings' maydonini populate qilamiz
        .lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun
    return { 
        success: true,
        msg: "Mijoz topildi", 
        data 
    };
}


}
module.exports = new CustomerService();    