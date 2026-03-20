const { ExportExcelCustomerOrders } = require("../../../utils/ExportExcel");

class CustomerManagmentService {
  async Create(req, data) {
    const { Customer } = req.tenantModels;
    const { action, model } = data;

    try {
      if (action === "create") {
        const customerExists = await Customer.exists({
          $or: [{ fullname: model.fullname }],
        });

        if (customerExists) {
          return { msg: "Bunday mijoz bazada mavjud!" };
        } else {
          // Yangi obyekt yaratish
          await Customer.create(model);
          return { status: "200", msg: "Mijoz muvaffaqiyatli qo'shildi!" };
        }
      }

      if (action === "update") {
        const { _id, ...updateData } = model;
        const updated = await Customer.findByIdAndUpdate(_id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updated) {
          return { msg: "O'zgartirish uchun mijoz topilmadi!" };
        }

        return { msg: "Mijoz muvaffaqiyatli o'zgartirildi!", data: updated };
      }

      return { msg: "Noto'g'ri amal turi" };
    } catch (error) {
      throw new Error("Error creating customer: " + error.message);
    }
  }

  async getAllLength(req) {
    const { Customer } = req.tenantModels;
    try {
      // .find().length o'rniga countDocuments ishlatish samaraliroq
      const all = await Customer.countDocuments();
      return { all };
    } catch (error) {
      return { all: 0 };
    }
  }

  async GetAll(req, data) {
    try {
      if (data) {
        const { all } = await this.getAllLength(req);
        const customers = await this.GetAllCustomers(req, data);
        return { customers, all_length: all };
      } else {
        return { msg: "Ma'lumotlar yetarli emas", customers: [] };
      }
    } catch (error) {
      return {
        msg: `Server xatosi: ${error.message}`,
        customers: [],
        all_length: 0,
      };
    }
  }

  async GetAllCustomers(req, data) {
    const { Customer } = req.tenantModels;
    try {
      // .lean() ma'lumotni tezroq o'qish uchun (faqat JSON qaytaradi)
      const customers = await Customer.find().lean();
      return customers || [];
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  async DeleteById(req, data) {
    const { Customer } = req.tenantModels;
    const { id } = data;
    try {
      const customer = await Customer.findByIdAndDelete(id);
      if (!customer) {
        return { msg: "Bunday mijoz topilmadi!" };
      }
      return { msg: "Mijoz muvaffaqiyatli o'chirildi!" };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

  async GetById(req, data) {
    const { Customer } = req.tenantModels;
    const { id } = data;
    try {
      const customer = await Customer.findById(id);
      if (!customer) {
        return { msg: "Bunday mijoz topilmadi!" };
      } else {
        return { msg: "Mijoz muvaffaqiyatli aniqlandi!", customer };
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

  async GetOrdersByCustomerId(req, data) {
    const { Order } = req.tenantModels;
    const { id } = data;
    try {
      const orders = await Order.find({ customerId: id })
        .populate("driverId")
        .populate("author")
        .populate("customerId");

      return { msg: "ok", status: 200, orders };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

  async ExportExcelDownload(req, data) {
    
    try {
      const result = await ExportExcelCustomerOrders(req, data);
      if (!result || !result.buffer) {
        throw new Error("Excel faylini yaratishda xatolik yuz berdi");
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new CustomerManagmentService();