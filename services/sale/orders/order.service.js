const mongoose = require("mongoose");
const BotDriverService = require("../../../bots/drivers/services/driver.service");
const { generateUniqueOrderNumber } = require("../../../utils/generateUniqueNumber");

class OrderManagmentService {
  // 📌 Buyurtma yaratish
  async Create(req, data) {
    const { Order } = req.tenantModels;
    try {
      const orderNumber = await generateUniqueOrderNumber();
      const savedOrder = await Order.create({
        ...data,
        orderNumber,
      });
      return { msg: "Buyurtma muvaffaqiyatli qo'shildi!", order: savedOrder };
    } catch (error) {
      throw new Error("Buyurtma yaratishda xatolik: " + error.message);
    }
  }

  // 📌 Haydovchiga yuborish va yangilash
  async UpdateById(req, data) {
    const { Order } = req.tenantModels;
    const { orderId, fullname: DriverID, deliveryTime: DeliveryTime } = data;

    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          status: "Haydovchiga yuborilmoqda",
          driverId: DriverID,
          deliveryTime: DeliveryTime,
          driverSentToTime: new Date(),
        },
        { new: true }
      )
      .populate("driverId", "chatId")
      .populate("customerId")
      .populate("author", "username fullname position");

      if (!updatedOrder) return { status: 404, msg: "Buyurtma topilmadi" };

      // Multi-tenant bot servisini chaqirish
      await BotDriverService.SentOrder(updatedOrder);

      return { status: 200, msg: "Haydovchiga muvaffaqiyatli yuborildi" };
    } catch (error) {
      return { status: 500, msg: "Yangilashda xatolik: " + error.message };
    }
  }

  // 📌 ID bo'yicha olish
  async OrderGetById(req, data) {
    const { Order } = req.tenantModels;
    if (!mongoose.Types.ObjectId.isValid(data.id)) {
      return { status: 400, msg: "Noto'g'ri ID format." };
    }

    try {
      const order = await Order.findById(data.id)
        .populate("customerId")
        .populate("author", "fullname position username")
        .lean();

      if (!order) return { status: 404, msg: "Buyurtma topilmadi." };

      return { status: 200, msg: "Buyurtma ma'lumoti yuborildi", order };
    } catch (error) {
      return { status: 500, msg: "Server xatosi: " + error.message };
    }
  }

  // 📌 Jami sonini olish (Performance uchun countDocuments)
  async getAllLength(req) {
    const { Order } = req.tenantModels;
    try {
      const all = await Order.countDocuments();
      return { all };
    } catch (error) {
      return { all: 0 };
    }
  }

  // 📌 Filtrlash va barcha buyurtmalarni olish
  async GetAll(req, data) {
    const { Order } = req.tenantModels;
    try {
      // 1. Qidiruv mavjud bo'lsa
      if (data.filter && data.filter.fullname !== "") {
        const searchRegex = new RegExp(data.filter.fullname, "i");
        
        const orders = await Order.aggregate([
          {
            $lookup: {
              from: "customers", // Bu yerda tenant bazasidagi collection nomi
              localField: "customerId",
              foreignField: "_id",
              as: "customerData",
            },
          },
          { $unwind: "$customerData" },
          {
            $match: {
              $or: [
                { "customerData.fullname": searchRegex },
                { "customerData.phoneNumber": searchRegex },
                { "orderNumber": searchRegex }
              ],
            },
          },
          { $sort: { createdAt: -1 } }
        ]);

        const { all } = await this.getAllLength(req);
        return { orders, all_length: all };
      }

      // 2. Oddiy listing (status = 1 yoki filter yo'q bo'lsa)
      const { all } = await this.getAllLength(req);
      const orders = await this.GetAllOrders(req, data);
      return { orders, all_length: all };

    } catch (error) {
      return { msg: `Server xatosi: ${error.message}`, orders: [], all_length: 0 };
    }
  }

  // 📌 Paginatsiya bilan olish
  async GetAllOrders(req, data) {
    const { Order } = req.tenantModels;
    const page = Number(data.page) || 1;
    const limit = Number(data.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      return await Order.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("customerId")
        .lean();
    } catch (error) {
      return [];
    }
  }

  // 📌 Haydovchilar ro'yxatini olish (Tenant User bazasidan)
  async GetAllDrivers(req) {
    const { User } = req.tenantModels;
    try {
      const drivers = await User.find({
        $or: [
          { position: { $regex: /haydovchi/i } },
          { "roles.name": { $regex: /driver|haydovchi/i } }
        ]
      }).select("fullname chatId phone position").lean();

      return { drivers };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

  // 📌 O'chirish (Huquq tekshiruvi bilan)
  async DeleteById(req, data) {
    const { Order } = req.tenantModels;
    try {
      const { id, author } = data;
      const order = await Order.findOne({ _id: id, author: author });
      
      if (!order) {
        return { msg: "Buyurtma topilmadi yoki o'chirish huquqi yo'q!", status: 403 };
      }

      await Order.findByIdAndDelete(id);
      return { msg: "Muvaffaqiyatli o'chirildi!", status: 200 };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}`, status: 500 };
    }
  }
}

module.exports = new OrderManagmentService();