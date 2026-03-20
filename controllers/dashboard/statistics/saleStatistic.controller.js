const SaleStatisticsService = require("../../../services/dashboard/statistics/saleStatistic.service");

class SaleStatisticsController {
    async GetSaleStatistics(req, res) {
        try {
            const statistics = await SaleStatisticsService.getSaleStatistics(req,req.query); // <-- BU YERGA await QO‘SHILDI
            res.status(200).json({ success: true, statistics });
        } catch (error) {
            res.status(500).json({ success: false, message: "Ichki server xatosi" });
        }
    }
    
}

module.exports = new SaleStatisticsController();
