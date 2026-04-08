// Modellarni import qilish
const UserSchema = require("../models/user.model.js");
const RoleSchema = require("../models/Admin/role.model.js");
const PermissionSchema = require("../models/Admin/permission.model.js");
const TokenSchema = require("../models/token.model.js");
const TabelSchema = require("../models/Tabel/tabel.model.js");
const BookingSchema = require("../models/Tabel/booking.model.js");


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
        Booking: getModel('Booking', BookingSchema),

       
    };
};

module.exports = initModels;