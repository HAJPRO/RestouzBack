// Modellarni import qilish
const UserSchema = require("../models/user.model.js");
const RoleSchema = require("../models/Admin/role.model.js");
const PermissionSchema = require("../models/Admin/permission.model.js");
const TokenSchema = require("../models/token.model.js");
const TabelSchema = require("../models/Tabel/tabel.model.js");
const MenuSchema = require("../models/Menu/menu.model.js");
const CartSchema = require("../models/Menu/cart.model.js");
const TransactionSchema = require("../models/Menu/transaction.model.js");
const BookingSchema = require("../models/Tabel/booking.model.js");
const CategorySchema = require("../models/Menu/category.model.js");
const EmployeeSchema = require("../models/HR/Employee/employee.model.js");
const DepartmentSchema = require("../models/HR/Department/department.model.js");
const FeeSchema = require("../models/Settings/service/fee.model.js");
const CustomerSchema = require("../models/Customers/customer.model.js");
const ZoneSchema = require("../models/Zone/zone.model.js");

const initModels = (db) => {
    // Modelni bazadan olish yoki yaratish funksiyasi
    const getModel = (name, schema) => db.models[name] || db.model(name, schema);

    return {
        // Admin & Auth
        User: getModel('User', UserSchema),
        Role: getModel('Role', RoleSchema),
        Permission: getModel('Permission', PermissionSchema),
        Token: getModel('Token', TokenSchema),
        Tabel: getModel('Tabel', TabelSchema),
        Menu: getModel('Menu', MenuSchema),
        Cart: getModel('Cart', CartSchema),
        Transaction: getModel('Transaction', TransactionSchema),
        Booking: getModel('Booking', BookingSchema),
        Category: getModel('Category', CategorySchema),
        Employee: getModel('Employee', EmployeeSchema),
        Department: getModel('Department', DepartmentSchema),
        Customer: getModel('Customer', CustomerSchema),
        Fee: getModel('Fee', FeeSchema),
        Zone: getModel('Zone', ZoneSchema),

       
    };
};

module.exports = initModels;