const DriverService = require("../../services/drivers/driver.service")

class DriverController {
    // **1. Faol haydovchilarni olish (API orqali)**
    async getActiveDrivers(req, res) {
        try {
            const drivers = DriverService.getActiveDrivers(req);
            res.status(200).json({ success: true, drivers });
        } catch (error) {
            console.error("❌ Haydovchilarni olishda xatolik:", error);
            res.status(500).json({ success: false, message: "Ichki server xatosi" });
        }
    }

}

module.exports = new DriverController();
