const BaseError = require("../../errors/base.error");

class OrderService {
  async Create(req) {
    const { Menu } = req.tenantModels;
    
    // Agar body bo'sh bo'lsa, demak JSON limit yoki Header muammosi bor
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
    }

    const { action, _id, image } = req.body;
    console.log("Kelingan Action:", action); 

    if (action === 'create') {
        if (!image) throw new BaseError("Rasm majburiy", 400);
        const data = await Menu.create(req.body);   
        return { msg: "Muvaffaqiyatli yaratildi", data };

    } else if (action === 'edit') {
        if (!_id) throw new BaseError("ID topilmadi", 400);
        const updated = await Menu.findByIdAndUpdate(_id, req.body, { new: true });
        return { msg: "Muvaffaqiyatli yangilandi", data: updated };
    }

    throw new BaseError("Noto'g'ri action: " + action, 400);
}
     async GetAll(req) {
    const { Cart } = req.tenantModels;

    // Menu modelidagi 'bookings' maydonini populate qilamiz
    const data = await Cart.find().lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun

    return { 
        success: true,
        msg: "Barcha buyurtmalar ", 
        data 
    };
}
     async GetById(req) {
    const { Menu } = req.tenantModels;
    const data = await Menu.findById(req.params.id)
        .populate('bookings') // 'bookings' maydonini populate qilamiz
        .lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun
    return { 
        success: true,
        msg: "MENU TOPILDI", 
        data 
    };
}


}
module.exports = new OrderService();    