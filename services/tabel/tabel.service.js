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


}

module.exports = new TabelService();