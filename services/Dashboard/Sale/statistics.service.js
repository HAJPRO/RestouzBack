const BaseError = require("../../../errors/base.error");
const moment = require("moment");
const mongoose = require("mongoose");

class StatisticsService {
    /**
     * Dashboard statistikasi (Tushum, Buyurtmalar, To'lov turlari)
     */
   async GetDashboardStats(req) {
    const { Cart } = req.tenantModels;
    const { period = 'Hafta' } = req.query;
    const { start, end } = this._getDateRange(period);

    try {
        const summary = await Cart.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $ifNull: ["$finalTotal", 0] } },
                    totalOrders: { $count: {} },
                    // "payments" massivi ichidagi har bir elementni tekshiramiz
                    // Bu usul "mixed" (aralash) to'lovlarni ham ichidan ajratib olib to'g'ri hisoblaydi
                    cash: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: "$payments",
                                    as: "p",
                                    in: { $cond: [{ $eq: ["$$p.type", "cash"] }, "$$p.amount", 0] }
                                }
                            }
                        }
                    },
                    card: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: "$payments",
                                    as: "p",
                                    in: { $cond: [{ $eq: ["$$p.type", "card"] }, "$$p.amount", 0] }
                                }
                            }
                        }
                    },
                    debt: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: "$payments",
                                    as: "p",
                                    in: { $cond: [{ $eq: ["$$p.type", "debt"] }, "$$p.amount", 0] }
                                }
                            }
                        }
                    },
                    balance: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: "$payments",
                                    as: "p",
                                    in: { $cond: [{ $eq: ["$$p.type", "balance"] }, "$$p.amount", 0] }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        const s = summary[0] || {};
        const totalRevenue = s.totalRevenue || 0;
        const totalOrders = s.totalOrders || 0;

        const chartDataRaw = await this._getChartData(req, period, start, end);

        return {
            success: true,
            msg: `${period}lik statistika yuklandi`,
            data: {
                totalRevenue,
                totalOrders,
                averageCheck: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
                payments: [
                    { label: 'Naqd', value: s.cash || 0 },
                    { label: 'Karta', value: s.card || 0 },
                    { label: 'Nasiya', value: s.debt || 0 },
                    { label: 'Depozit', value: s.balance || 0 }
                ],
                chartData: this._formatChartForUI(chartDataRaw, period)
            }
        };
    } catch (error) {
        console.error("Dashboard Error:", error);
        throw new BaseError("Statistika hisoblashda xatolik yuz berdi", 500);
    }
}

    /**
     * Top Mijozlar - $lookup orqali mijoz ismini olamiz
     */
    async GetTopCustomers(req) {
        const { Cart } = req.tenantModels;
        const limit = parseInt(req.query.limit) || 10;

        try {
            const data = await Cart.aggregate([
                { 
                    $match: { 
                        status: 'completed', 
                        customerId: { $ne: null } 
                    } 
                },
                {
                    $group: {
                        _id: "$customerId",
                        totalSpent: { $sum: "$finalTotal" },
                        orderCount: { $count: {} }
                    }
                },
                // Customer kolleksiyasidan ma'lumotlarni olib kelish
                {
                    $lookup: {
                        from: "customers", // Kolleksiya nomi bazada odatda kichik harf va ko'plikda bo'ladi
                        localField: "_id",
                        foreignField: "_id",
                        as: "customerInfo"
                    }
                },
                { $unwind: { path: "$customerInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        totalSpent: 1,
                        orderCount: 1,
                        name: { $ifNull: ["$customerInfo.name", "Noma'lum mijoz"] },
                        phone: "$customerInfo.phone"
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: limit }
            ]);

            return { success: true, data };
        } catch (error) {
            console.error("Top Customers Error:", error);
            throw new BaseError("Mijozlar tahlilida xatolik", 500);
        }
    }

    /**
     * Top Sotuvlar
     */
    async GetTopSales(req) {
        const { Cart } = req.tenantModels;
        const limit = parseInt(req.query.limit) || 5;

        try {
            const data = await Cart.aggregate([
                { $match: { status: 'completed' } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.foodId",
                        name: { $first: "$items.name" },
                        totalSold: { $sum: "$items.quantity" },
                        revenue: { $sum: "$items.totalPrice" }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: limit }
            ]);

            return { success: true, data };
        } catch (error) {
            throw new BaseError("Mahsulotlar tahlilida xatolik", 500);
        }
    }

    // --- Private Methods (Vaqt va Formatlash) ---

    async _getChartData(req, period, start, end) {
        const { Cart } = req.tenantModels;
        let groupId;
        switch (period) {
            case 'Kun': groupId = { $hour: "$createdAt" }; break;
            case 'Yil': groupId = { $month: "$createdAt" }; break;
            case 'Oy': groupId = { $dayOfMonth: "$createdAt" }; break;
            default: groupId = { $dayOfWeek: "$createdAt" }; 
        }

        return await Cart.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, status: 'completed' } },
            {
                $group: {
                    _id: groupId,
                    value: { $sum: "$finalTotal" },
                    label: { $first: "$createdAt" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
    }

    _formatChartForUI(data, period) {
        if (!data || data.length === 0) return [];
        const maxValue = Math.max(...data.map(d => d.value), 1);
        return data.map(item => {
            const date = moment(item.label);
            let label = period === 'Kun' ? date.format('HH:00') : 
                        period === 'Hafta' ? date.format('ddd') :
                        period === 'Oy' ? date.format('DD.MM') : date.format('MMM');
            return { label, value: item.value, percent: Math.round((item.value / maxValue) * 100) };
        });
    }

    _getDateRange(period) {
        const end = moment().endOf('day').toDate();
        let start;
        switch (period) {
            case 'Kun': start = moment().startOf('day').toDate(); break;
            case 'Hafta': start = moment().subtract(6, 'days').startOf('day').toDate(); break; 
            case 'Oy': start = moment().startOf('month').toDate(); break;
            case 'Yil': start = moment().startOf('year').toDate(); break;
            default: start = moment().subtract(6, 'days').startOf('day').toDate();
        }
        return { start, end };
    }
}

module.exports = new StatisticsService();