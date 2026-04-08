const BaseError = require("../../errors/base.error");

class TabelService {
    async Create(req) {
        const { Tabel } = req.tenantModels;
const data = await Tabel.create(req.body)
        return { msg: "YANGI TABEL QO'SHMOQCHIMISAN " }

    }
      async GetAll(req) {
        const { Tabel } = req.tenantModels;
const data = await Tabel.find()
        return { msg: "BARCHA TABELLAR", data }
    }

    ///Booking service
    async CreateBooking(req) {
    const { Booking, Tabel } = req.tenantModels; // Tabel modelini ham olamiz
    const { _id, ...bookingData } = req.body; 

    // 1. Booking obyektini yaratish
    // Fronteddan kelayotgan _id ni table_id ga o'giramiz
    const newBooking = await Booking.create({
        ...bookingData,
        table_id: _id 
    });

    // 2. Stol holatini yangilash ("2" -> Bron qilingan)
    // Stolni band (1) emas, aynan bron (2) holatiga o'tkazamiz
    await Tabel.findByIdAndUpdate(_id, { 
        status: 2 
    });

    return { 
        success: true,
        msg: "Stol muvaffaqiyatli band qilindi", 
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