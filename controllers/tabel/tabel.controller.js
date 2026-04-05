const TabelService = require("../../services/tabel/tabel.service");

class TabelController {

    async Create(req, res, next) {
        try {
            // Service-dan qaytgan ma'lumotni olamiz
            const data = await TabelService.Create(req);

            // Frontend-ga javob qaytarish
            return res.status(201).json({
                success: true,
                message: "Tabel muvaffaqiyatli yaratildi",
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

}

module.exports = new TabelController();
