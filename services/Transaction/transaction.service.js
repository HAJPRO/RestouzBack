const BaseError = require("../../errors/base.error");
const mongoose = require("mongoose");

class TransactionService {
    async Create(req) {
        const { Transaction, Customer } = req.tenantModels;
        
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BaseError("Tranzaksiya ma'lumotlari kiritilmadi", 400);
        }

        const { customerId, type, amount, method, description } = req.body;

        // 1. Validatsiya
        if (!type || !amount || !method) {
            throw new BaseError("Tur, summa va to'lov usuli kiritilishi shart", 400);
        }

        // 2. Tranzaksiyani boshlash (Mijoz balansi va Tranzaksiya tarixi bir vaqtda o'zgarishi shart)
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 3. Tranzaksiyani yaratish
            const newTransaction = await Transaction.create([{
                customerId,
                type,
                amount,
                method,
                description,
                staffId: req.user._id // Operatsiyani bajargan xodim
            }], { session });

            // 4. Mijoz balansini yangilash
            if (customerId) {
                /**
                 * payment va surplus balansni oshiradi (+)
                 * debt va refund balansni kamaytiradi (-)
                 */
                const balanceEffect = (type === 'payment' || type === 'surplus') ? amount : -amount;

                const updatedCustomer = await Customer.findByIdAndUpdate(
                    customerId,
                    { $inc: { balance: balanceEffect } },
                    { session, new: true }
                );

                if (!updatedCustomer) {
                    throw new BaseError("Mijoz topilmadi", 404);
                }
            }

            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                msg: "Tranzaksiya muvaffaqiyatli amalga oshirildi",
                data: newTransaction[0]
            };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async GetAll(req) {
        const { Transaction } = req.tenantModels;
        const { customerId, type, startDate, endDate } = req.query;

        // Filtrlash mantiqi
        let query = {};
        if (customerId) query.customerId = customerId;
        if (type) query.type = type;
        
        // Sana bo'yicha filtrlash (masalan, bugungi tranzaksiyalar)
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const data = await Transaction.find(query)
            .populate('customerId', 'name phone') // Mijozning faqat kerakli ma'lumotlari
            .populate('staffId', 'name')        // Xodim ismi
            .sort({ createdAt: -1 })
            .lean();

        return { 
            success: true,
            msg: "Tranzaksiyalar ro'yxati", 
            data 
        };
    }

    async GetById(req) {
        const { Transaction } = req.tenantModels;
        
        const data = await Transaction.findById(req.params.id)
            .populate('customerId')
            .populate('staffId', 'name')
            .lean();
        
        if (!data) {
            throw new BaseError("Tranzaksiya topilmadi", 404);
        }

        return { 
            success: true,
            data 
        };
    }

    // DIQQAT: Tranzaksiyalar odatda o'chirilmaydi! 
    // Lekin texnik xato bo'lsa, faqat admin o'chirishi mumkin bo'lgan metod:
    async Delete(req) {
        const { Transaction, Customer } = req.tenantModels;
        const { id } = req.params;

        const trx = await Transaction.findById(id);
        if (!trx) throw new BaseError("Tranzaksiya topilmadi", 404);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // O'chirilayotgan tranzaksiyaning mijoz balansiga ta'sirini qaytarish (Reverse)
            if (trx.customerId) {
                const reverseEffect = (trx.type === 'payment' || trx.type === 'surplus') ? -trx.amount : trx.amount;
                await Customer.findByIdAndUpdate(trx.customerId, { $inc: { balance: reverseEffect } }, { session });
            }

            await Transaction.findByIdAndDelete(id, { session });

            await session.commitTransaction();
            return { success: true, msg: "Tranzaksiya bekor qilindi va balans qaytarildi" };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

module.exports = new TransactionService();