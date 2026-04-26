const BaseError = require("../../errors/base.error");

class TabelService {
    async Create(req) {
        console.log("uq")
        const { Tabel } = req.tenantModels;
       const  {action} = req.body;
       if(action === 'create'){
      const data = await Tabel.create(req.body)
        return { msg: "YANGI TABEL QO'SHMOQCHIMISAN " }
       } else if(action === 'edit'){
        const { _id, ...updateData } = req.body;
        const updatedTabel = await Tabel.findByIdAndUpdate(
            _id,
            updateData,
            { new: true }
        );
        if (!updatedTabel) {
            throw new BaseError("Tabel topilmadi", 404);
        }
    }    return { msg: "TABEL MUVAFFAQIYATLI YARATILDI" }
}
     async GetAll(req) {
    const { Tabel } = req.tenantModels;

    // Tabel modelidagi 'bookings' maydonini populate qilamiz
  const data = await Tabel.find()
  .populate([
    { 
      path: 'bookings' 
    },
    {
      path: 'zoneId', // Zone ma'lumotlarini olib kelish
    //   select: 'name color' // Masalan: faqat nomi va rangini olish (ixtiyoriy)//
    },
    { 
      path: 'cartId',
      populate: [
        {
          path: 'items.foodId',
          select: 'image'
        },
        {
          path: 'staffId',
          select: 'firstname lastname'
        },
        {
          path: 'customerId',
        }
      ]
    }
  ])
  .lean();

    return { 
        success: true,
        msg: "BARCHA TABELLAR VA BRONLAR", 
        data 
    };
}
async GetById(req) {
    const { Tabel } = req.tenantModels;
    const data = await Tabel.findById(req.params.id)
        .populate('bookings')
        .lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun
    return { 
        success: true,
        msg: "TABEL TOPILDI", 
        data 
    };
}

    ///Booking service
  async CreateBooking(req) {
    const { Booking, Tabel } = req.tenantModels;
    const { _id, ...bookingData } = req.body; 

    
    const newBooking = await Booking.create({
        ...bookingData,
        table_id: _id 
    });

   
    const updatedTable = await Tabel.findByIdAndUpdate(
        _id, 
        { 
            $push: { bookings: newBooking._id } // Bronlar ro'yxatiga ID qo'shamiz
        },
        { new: true } // Yangilangan stol ma'lumotini qaytarish uchun
    );

    if (!updatedTable) {
        throw new Error("Stol topilmadi");
    }

    return { 
        success: true,
        msg: "Stol muvaffaqiyatli bron qilindi", 
        data: newBooking 
    };
}
async GetTableBookings(req) {
    const { Booking } = req.tenantModels;
    const bookings = await Booking.find({ table_id: req.params.id });   
    return {
        success: true,
        msg: "Barcha bronlar olindi",
        data: bookings
    };
}
}
module.exports = new TabelService();    