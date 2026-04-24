const BaseError = require("../../errors/base.error");

class OrderService {
  async Create(req) {
    const { Menu } = req.tenantModels;
    
    // Agar body bo'sh bo'lsa, demak JSON limit yoki Header muammosi bor
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new BaseError("Ma'lumotlar qabul qilinmadi (JSON body bo'sh)", 400);
    }

    const { action, _id, image } = req.body;
    console.log("Kelingan Action:", action); 

    if (action === 'create') {
        if (!image) throw new BaseError("Rasm majburiy", 400);
        const data = await Menu.create(req.body);   
        return { msg: "Muvaffaqiyatli yaratildi", data };

    } else if (action === 'edit') {
        if (!_id) throw new BaseError("ID topilmadi", 400);
        const updated = await Menu.findByIdAndUpdate(_id, req.body, { new: true });
        return { msg: "Muvaffaqiyatli yangilandi", data: updated };
    }

    throw new BaseError("Noto'g'ri action: " + action, 400);
}
    async GetAll(req) {
    const { Cart } = req.tenantModels;

    // customerId, staffId va tableId maydonlarini populate qilamiz
    const data = await Cart.find()
        .populate('customerId')
        .populate('staffId')
        .populate('tableId')
        .lean(); // JS obyekti sifatida tezroq qaytarish uchun

    return { 
        success: true,
        msg: "Barcha buyurtmalar", 
        data 
    };
}
     async GetById(req) {
    const { Menu } = req.tenantModels;
    const data = await Menu.findById(req.params.id)
        .populate('bookings') // 'bookings' maydonini populate qilamiz
        .lean(); // Tezroq ishlashi va JS obyekti sifatida qaytarishi uchun
    return { 
        success: true,
        msg: "MENU TOPILDI", 
        data 
    };
}
/**
 * To'lovni yakunlash va orderni yopish
 * @param {Object} req - Request object
 */
async SubmitPayment(req) {
  const { Cart, Customer, Tabel } = req.tenantModels;
  const { 
    orderId, 
    customerId, 
    payments, 
    surplusAmount, 
    tableId 
  } = req.body;

  const session = await Cart.startSession();
  session.startTransaction();

  try {
    // 1. To'lov turlarini ajratib olamiz
    const debtAmount = payments.find(p => p.type === 'debt')?.amount || 0;
    const usedBalanceAmount = payments.find(p => p.type === 'balance')?.amount || 0;

    // 2. Buyurtmani (Cart) yopish
    await Cart.findByIdAndUpdate(orderId, {
      $set: {
        status: 'completed',
        payments: payments,
        surplusAmount: surplusAmount || 0,
        isDebtClosed: debtAmount <= 0
      }
    }, { session });

    // 3. Mijoz balansini matematik to'g'ri yangilash
    if (customerId) {
      /**
       * FORMULA:
       * balanceChange = Ortiqcha pul (Qaytim) - Olingan qarz - Ishlatilgan depozit
       * * Masalan: 
       * 1. Qaytim (surplus): +10,000
       * 2. Qarz (debt): -5,000
       * 3. Balansdan to'lov (usedBalance): -20,000
       */
      const balanceChange = (surplusAmount || 0) - debtAmount - usedBalanceAmount;

      if (balanceChange !== 0) {
        await Customer.findByIdAndUpdate(customerId, { 
          $inc: { balance: balanceChange } 
        }, { session });
      }
    }
    
    // 4. Stolni bo'shatish
    await Tabel.findByIdAndUpdate(tableId, { 
      $set: { status: '0', cartId: null } 
    }, { session });

    await session.commitTransaction();
    return { success: true };

  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}



}
module.exports = new OrderService();    