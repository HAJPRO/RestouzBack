// Statik importlar olib tashlandi
class EmployeeManagmentService {
    // 📌 Xodim yaratish
    async Create(req, data) {
        const { User } = req.tenantModels;
        try {
            const employeeExists = await User.exists({
                $or: [
                    { passportNumber: data.passportNumber },
                    { artikul: data.artikul },
                ],
            });

            if (employeeExists) {
                return { msg: "Bunday xodim bazada mavjud!" };
            }

            // create() metodidan foydalanish qisqaroq va xavfsizroq
            const newEmployee = await User.create(data);
            return { status: "200", msg: "Xodim muvaffaqiyatli qo'shildi!", data: newEmployee };
        } catch (error) {
            throw new Error("Xodim yaratishda xatolik: " + error.message);
        }
    }

    // 📌 Umumiy sonini olish (Optimallashtirilgan)
    async getAllLength(req) {
        const { User } = req.tenantModels;
        try {
            const all = await User.countDocuments();
            return { all };
        } catch (error) {
            return { all: 0 };
        }
    }

    // 📌 Xodimlarni status bo'yicha olish
    async GetAll(req, data) {
        try {
            const { status } = data;

            if (!status || status === 0) {
                const { User } = req.tenantModels;
                const employees = await User.find().lean();
                return { employees };
            }
            
            if (status === 1) {
                const { all } = await this.getAllLength(req);
                const employees = await this.GetAllEmployees(req, data);
                return { employees, all_length: all };
            }
            
            if (status === 3) {
                const { all } = await this.getAllLength(req);
                const employees = await this.GetAllDrivers(req, data);
                return { employees, all_length: all };
            }

            return { msg: "Noto'g'ri status kodi", employees: [] };
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}`, employees: [], all_length: 0 };
        }
    }

    // 📌 Barcha xodimlarni paginatsiya bilan olish
    async GetAllEmployees(req, data) {
        const { User } = req.tenantModels;
        const page = Number(data.page) || 1;
        const limit = Number(data.limit) || 10;
        const skip = (page - 1) * limit;

        try {
            return await User.find()
                .populate("roles", "name permissions")
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error(`Xodimlarni yuklashda xatolik: ${error.message}`);
        }
    }

    // 📌 Faqat haydovchilarni olish
    async GetAllDrivers(req, data) {
        const { User } = req.tenantModels;
        const page = Number(data.page) || 1;
        const limit = Number(data.limit) || 10;
        const skip = (page - 1) * limit;

        try {
            return await User.find({ position: "Haydovchi" })
                .populate("roles", "name permissions")
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error(`Haydovchilarni yuklashda xatolik: ${error.message}`);
        }
    }

    // 📌 ID bo'yicha o'chirish
    async DeleteById(req, data) {
        const { User } = req.tenantModels;
        try {
            const deleted = await User.findByIdAndDelete(data.id);
            if (!deleted) return { msg: "Xodim topilmadi!" };
            return { msg: "Xodim muvaffaqiyatli o'chirildi!" };
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }

    // 📌 ID bo'yicha ma'lumot olish
    async GetById(req, data) {
        const { User } = req.tenantModels;
        try {
            const user = await User.findById(data.id).populate("roles", "name");
            if (!user) return { msg: "Xodim topilmadi!" };

            const roleNames = user.roles ? user.roles.map(role => role.name) : [];
            const customer = {
                ...user.toObject(),
                roles: roleNames
            };

            return { msg: "Xodim aniqlandi!", customer };
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }

    // 📌 Haydovchining buyurtmalarini olish
    async GetOrdersByDriverId(req, data) {
        const { Order } = req.tenantModels;
        try {
            const orders = await Order.find({ driverId: data.id })
                .populate('driverId')
                .populate('author')
                .populate('customerId');

            return { msg: "ok", status: 200, orders };
        } catch (error) {
            return { msg: `Server xatosi: ${error.message}` };
        }
    }
}

module.exports = new EmployeeManagmentService();