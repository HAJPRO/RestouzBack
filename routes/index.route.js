// routes/index.js

module.exports = {
  AuthRouter: require("./auth/auth.route.js"),
  ZoneRouter: require("./zone/zone.route.js"),
  CustomerRouter: require("./customer/customer.route.js"),
  DepartmentRouter: require("./hr/department/department.route.js"),
  EmployeeRouter: require("./hr/employee/employee.route.js"),
  MenuRouter: require("./menu/menu.route.js"),
  OrderRouter: require("./order/order.route.js"),
  PermissionRouter: require("./settings/permission/permission.route.js"),
  RoleRouter: require("./settings/role/role.route.js"),
  UserRouter: require("./settings/users/user.route.js"),
  FeeRouter: require("./settings/service/fee.route.js"),
  TabelRouter: require("./tabel/tabel.route.js"),
  TransactionRouter: require("./transaction/transaction.route.js"),
 StatisticsRouter: require("./dashboard/sale/statistics.route.js")
};