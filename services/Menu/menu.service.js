const BaseError = require("../../errors/base.error");

class MenuService {
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
    const { Menu } = req.tenantModels;

    // Menu modelidagi 'bookings' maydonini populate qilamiz
    const data = await Menu.find().lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun

    return { 
        success: true,
        msg: "BARCHA MENULAR", 
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

////Kategoriya 
async CreateCategory(req) { // 1. async qo'shildi
    const { Category } = req.tenantModels;
    const { action, ...CategoryModel } = req.body;

    if (!CategoryModel.name) {
        throw new BaseError("Kategoriya nomi kiritilishi kerak", 400);
    }

    if (action === 'create') {
        // 2. await qo'shildi
        const data = await Category.create(CategoryModel); 
        return { msg: "Kategoriya yaratildi", data };
    } 
    
    if (action === 'edit') {
        if (!CategoryModel._id) {
            throw new BaseError("Kategoriya ID kiritilishi kerak", 400);
        }
        // 3. await qo'shildi
        const updated = await Category.findByIdAndUpdate(
            CategoryModel._id, 
            CategoryModel, 
            { new: true }
        );
        return { msg: "Kategoriya yangilandi", data: updated };
    }

    throw new BaseError("Noto'g'ri amal (action)", 400);
}
 async GetAllCategories(req) {
    const { Category } = req.tenantModels;

    // Barcha kategoriyalarni bazadan olamiz
    const categories = await Category.find().sort({ order: 1 }).lean(); 
    // MUHIM: Shunchaki massiv emas, aniq struktura qaytaramiz
    return categories
}

  ///Cart
  async CreateOrder(req) {
        const { Cart,Tabel } = req.tenantModels;
        const { action, ...orderData } = req.body;
        const data = await Cart.create(orderData);

        await Tabel.findByIdAndUpdate(data.tableId,{status:1,cartId:data._id},{new:true})
        return data;
  }
   async UpdateOrder(req) {
    const { Cart } = req.tenantModels;
    
    const { id,orderData } = req.body; 
    const data = await Cart.findByIdAndUpdate(
        id, 
        {edit:true,...orderData}, 
        { new: true, runValidators: true } // runValidators: yangilashda ham model qoidalarini tekshiradi
    );

    if (!data) {
        throw new Error("Buyurtma topilmadi"); // Agar ID xato bo'lsa
    }   

    return data;
}
}
module.exports = new MenuService();    