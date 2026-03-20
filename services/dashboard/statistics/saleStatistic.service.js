// ❌ Statik importni o'chirib tashlaymiz
// const Order = require('../../../models/Sale/orders/sales.model');
const moment = require('moment-timezone');

class SaleStatisticService {
    async getSaleStatistics(req, query) { // ✅ req parametri qo'shildi
        const { Order } = req.tenantModels; // ✅ Dinamik model
        const { period, start, end, timezone = 'Asia/Tashkent' } = query;
        let startDate, endDate;

        // 1. Vaqt chegaralarini aniqlash
        if (period === 'day') {
            startDate = moment.tz(timezone).startOf('day').toDate();
            endDate = moment.tz(timezone).endOf('day').toDate();
        } else if (period === 'week') {
            startDate = moment.tz(timezone).startOf('isoWeek').toDate();
            endDate = moment.tz(timezone).endOf('day').toDate();
        } else if (period === 'month') {
            startDate = moment.tz(timezone).startOf('year').toDate();
            endDate = moment.tz(timezone).endOf('year').toDate();
        } else if (period === 'custom') {
            startDate = moment.tz(start, timezone).startOf('day').toDate();
            endDate = moment.tz(end, timezone).endOf('day').toDate();
        }

        const stats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: "Yetkazib berildi" 
                }
            },
            {
                $facet: {
                    "metrics": [
                        {
                            $group: {
                                _id: null,
                                totalSales: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } },
                                totalProfit: { $sum: { $multiply: [{ $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } }, 0.1] } },
                                orderCount: { $sum: 1 }
                            }
                        }
                    ],
                    "chartData": [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { 
                                        format: period === 'day' ? "%H:00" : (period === 'month' ? "%Y-%m" : "%Y-%m-%d"), 
                                        date: "$createdAt",
                                        timezone: timezone 
                                    }
                                },
                                sales: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } },
                                profit: { $sum: { $multiply: [{ $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } }, 0.1] } }
                            }
                        }
                    ],
                    "topDrivers": [
                        { $group: { _id: "$driverId", count: { $sum: 1 }, totalSales: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } } } },
                        { $sort: { totalSales: -1 } }, { $limit: 10 },
                        // ✅ Tenant bazasidagi 'users' kolleksiyasiga lookup
                        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "info" } },
                        { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } }
                    ],
                    "topCustomers": [
                        { $group: { _id: "$customerId", totalSales: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } }, count: { $sum: 1 } } },
                        { $sort: { totalSales: -1 } }, { $limit: 10 },
                        // ✅ Tenant bazasidagi 'customers' kolleksiyasiga lookup (initModels'dagi nomga e'tibor bering)
                        { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "info" } },
                        { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } }
                    ],
                    "topSellers": [
                        { $group: { _id: "$author", totalSales: { $sum: { $convert: { input: "$totalAmount", to: "double", onError: 0, onNull: 0 } } }, count: { $sum: 1 } } },
                        { $sort: { totalSales: -1 } }, { $limit: 10 },
                        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "info" } },
                        { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } }
                    ]
                }
            }
        ]);

        return this.formatResponse(stats[0], period, startDate, endDate, timezone);
    }

    formatResponse(data, period, startDate, endDate, timezone) {
        if (!data) return { metrics: [], chart: { labels: [], series: [] } };

        const rawMetrics = data.metrics[0] || { totalSales: 0, totalProfit: 0, orderCount: 0 };
        const filledChart = this.fillMissingChartData(data.chartData, period, startDate, endDate, timezone);

        return {
            metrics: [
                { title: "Jami Sotuv", value: rawMetrics.totalSales, change: 0, icon: 'fa-bolt' },
                { title: "Sof Foyda", value: rawMetrics.totalProfit, change: 0, icon: 'fa-chart-line' },
                { title: "Buyurtmalar", value: rawMetrics.orderCount, change: 0, icon: 'fa-truck' }
            ],
            chart: filledChart,
            topDrivers: data.topDrivers.map(d => ({ info: { fullname: d.info?.fullname || "Noma'lum" }, count: d.count, totalSales: d.totalSales })),
            topCustomers: data.topCustomers.map(c => ({ info: { fullname: c.info?.fullname || "Noma'lum" }, totalSales: c.totalSales, count: c.count })),
            topSellers: data.topSellers.map(s => ({ info: { fullname: s.info?.fullname || s.info?.username || "Noma'lum" }, totalSales: s.totalSales, count: s.count }))
        };
    }

    fillMissingChartData(dbData, period, startDate, endDate, timezone) {
        const dataMap = new Map(dbData.map(item => [item._id, item]));
        const labels = [];
        const sales = [];
        const profit = [];

        let current = moment(startDate).tz(timezone);
        const last = moment(endDate).tz(timezone);

        while (current <= last) {
            let labelKey;
            let displayLabel;

            if (period === 'day') {
                labelKey = current.format("HH:00");
                displayLabel = labelKey;
                current.add(1, 'hour');
            } else if (period === 'month') {
                labelKey = current.format("YYYY-MM");
                displayLabel = this.getUzMonthName(current.month());
                current.add(1, 'month');
            } else {
                labelKey = current.format("YYYY-MM-DD");
                displayLabel = period === 'week' ? this.getUzDayName(current.day()) : labelKey;
                current.add(1, 'day');
            }

            const val = dataMap.get(labelKey) || { sales: 0, profit: 0 };
            labels.push(displayLabel);
            sales.push(val.sales);
            profit.push(val.profit);

            if (period === 'day' && labels.length >= 24) break;
            if (period === 'week' && labels.length >= 7) break;
            if (period === 'month' && labels.length >= 12) break;
        }

        return {
            labels,
            series: [
                { name: 'Sotuv', data: sales },
                { name: 'Foyda', data: profit }
            ]
        };
    }

    getUzMonthName(mIdx) {
        return ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"][mIdx];
    }

    getUzDayName(dIdx) {
        return ["Yak", "Du", "Se", "Cho", "Pa", "Ju", "Sha"][dIdx];
    }
}

module.exports = new SaleStatisticService();