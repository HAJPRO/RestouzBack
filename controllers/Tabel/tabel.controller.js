const {TabelService} = require("../../services/index.service");

class TabelController {

    async Create(req, res, next) {
        try {
            // Service-dan qaytgan ma'lumotni olamiz
            const data = await TabelService.Create(req);

            // Frontend-ga javob qaytarish
            return res.status(201).json({
                success: true,
                message: "Muvaffaqiyatli yaratildi",
                data: data // Yangi yaratilgan obyekt
            });

        } catch (error) {
            // Xatolikni errorMiddleware-ga uzatish
            next(error);
        }
    }
     async GetAll(req, res, next) {
        try {
            // Service-dan qaytgan ma'lumotni olamiz
            const data = await TabelService.GetAll(req);

            // Frontend-ga javob qaytarish
            return res.status(201).json({
                success: true,
                message: "BARCHA TABELLAR OLINDI",
                data // Yangi yaratilgan obyekt
            });

        } catch (error) {
            // Xatolikni errorMiddleware-ga uzatish
            next(error);
        }
    }
        async GetById(req, res, next) {
            try {
                const data = await TabelService.GetById(req);
                return res.status(200).json({
                    success: true,
                    message: "Tabel topildi",
                    data
                });
            } catch (error) {
                next(error);
            }
        }


    //Booking controller
     async CreateBooking(req, res, next) {
        try {
            // Service-dan qaytgan ma'lumotni olamiz
            const data = await TabelService.CreateBooking(req);
 // Frontend-ga javob qaytarish
            return res.status(201).json({
                success: true,
                message: "Tabel muvaffaqiyatli bron qilindi",
            });
        } catch (error) {
            // Xatolikni errorMiddleware-ga uzatish
            next(error);
        }
    }
    async GetTableBookings(req, res, next) {
        try {
            const data = await TabelService.GetTableBookings(req);
            return res.status(200).json({
                success: true,
                message: "Stolning barcha bronlari olindi",
                data
            });
        } catch (error) {
            next(error);
        }
    }


}

module.exports = new TabelController();
