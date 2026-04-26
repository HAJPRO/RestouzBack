// controllers/index.js

module.exports = {
  AuthController: require("./Auth/auth.controller.js"),
  ZoneController: require("./Zone/zone.controller.js"),
  CustomerController: require("./customer/customer.controller.js"),
  DepartmentController: require("./hr/department/department.controller.js"),
  EmployeeController: require("./hr/employee/employee.controller.js"),
  MenuController: require("./menu/menu.controller.js"),
  OrderController: require("./order/order.controller.js"),
  PermissionController: require("./settings/permission/permission.controller.js"),
  RoleController: require("./settings/role/role.controller.js"),
  UserController: require("./settings/users/user.controller.js"),
  FeeController: require("./settings/service/fee.controller.js"),
  TabelController: require("./tabel/tabel.controller.js"),
  TransactionController: require("./transaction/transaction.controller.js"),
  StatisticsController: require("./Dashboard/Sale/statistics.controller.js")
};