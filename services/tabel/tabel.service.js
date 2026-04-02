const BaseError = require("../../errors/base.error");

class TabelService {
    async Create(req) {
        const { } = req.tenantModels;
        console.log("ok");
        return { msg: "YANGI TABEL QO'SHMOQCHIMISAN " }


    }


}

module.exports = new TabelService();