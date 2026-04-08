const BaseError = require("../../errors/base.error");

class TabelService {
    async Create(req) {
        const { Tabel } = req.tenantModels;
const data = await Tabel.create(req.body)
        return { msg: "YANGI TABEL QO'SHMOQCHIMISAN " }

    }
     async GetAll(req) {
    const { Tabel } = req.tenantModels;

    // Tabel modelidagi 'bookings' maydonini populate qilamiz
    const data = await Tabel.find()
        .populate({
            path: 'bookings',
            // Agar faqat ma'lum vaqt oralig'idagi yoki bekor qilinmagan 
            // bronlar kerak bo'lsa, match qismini qo'shish mumkin:
            // match: { status: { $ne: 'cancelled' } } 
        })
        .lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun

    return { 
        success: true,
        msg: "BARCHA TABELLAR VA BRONLAR", 
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