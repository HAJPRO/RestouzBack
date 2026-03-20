// Modellarni import qilish
const UserSchema = require("../models/user.model.js");
const RoleSchema = require("../models/Admin/role.model.js");
const PermissionSchema = require("../models/Admin/permission.model.js");
const TokenSchema = require("../models/token.model.js");
const CustomerSchema = require("../models/Customers/customer.model.js");
const LabAnalysisSchema = require("../models/Laboratory/laboratory.model.js");
const OrderSchema = require("../models/Sale/orders/order.model.js");
const SaleHistorySchema = require("../models/Sale/orders/sales.model.js");
const ProductSchema = require("../models/Sale/products/product.model.js");
const AccessoriesInboundSchema = require("../models/Supply/accessories/accessoriesInbound.model.js");
const AccessoriesSchema = require("../models/Supply/accessories/accessory.model.js");
const SupplyInboundSchema = require("../models/Supply/Inbound/inbound.model.js");
const ReadyWarehouseSchema = require("../models/warehouses/r-warehouse/Rwarehouse.model.js");
const RawMaterialSchema = require("../models/Supply/rawmaterial/rawmaterial.model.js");
const InboundHistorySchema = require("../models/warehouses/input/input.model.js");
const CounterpartySchema = require("../models/Supply/counterparty.model.js");

const initModels = (db) => {
    // Modelni bazadan olish yoki yaratish funksiyasi
    const getModel = (name, schema) => db.models[name] || db.model(name, schema);

    return {
        // Admin & Auth
        User: getModel('User', UserSchema),
        Role: getModel('Role', RoleSchema),
        Permission: getModel('Permission', PermissionSchema),
        Token: getModel('Token', TokenSchema),

        // CRM
        Customer: getModel('Customer', CustomerSchema),
        // Laboratory
        LabAnalysis: getModel('LabAnalysis', LabAnalysisSchema),
        // Sales & Orders
        Order: getModel('Order', OrderSchema),
        SaleHistory: getModel('SaleHistory', SaleHistorySchema),
        Product: getModel('Product', ProductSchema),

        // Supply
        AccessoriesInbound: getModel('AccessoriesInbound', AccessoriesInboundSchema),
        Accessory: getModel('Accessory', AccessoriesSchema),
        SupplyInbound: getModel('SupplyInbound', SupplyInboundSchema),
        Counterparty: getModel('Counterparty', CounterpartySchema),

        // Warehouses
        ReadyWarehouse: getModel('ReadyWarehouse', ReadyWarehouseSchema),
        RawMaterial: getModel('RawMaterial', RawMaterialSchema),
        InboundHistory: getModel('InboundHistory', InboundHistorySchema),
    };
};

module.exports = initModels;