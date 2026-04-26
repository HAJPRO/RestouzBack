// controllers/index.js

module.exports = {
  AuthController: require("./Auth/auth.controller.js"),
  ZoneController: require("./Zone/zone.controller.js"),
  CustomerController: require("./Customer/customer.controller.js"),
  DepartmentController: require("./HR/Department/department.controller.js"),
  EmployeeController: require("./HR/Employee/employee.controller.js"),
  MenuController: require("./Menu/menu.controller.js"),
  OrderController: require("./Order/order.controller.js"),
  PermissionController: require("./settings/permission/permission.controller.js"),
  RoleController: require("./settings/role/role.controller.js"),
  UserController: require("./settings/users/user.controller.js"),
  FeeController: require("./settings/service/fee.controller.js"),
  TabelController: require("./Tabel/tabel.controller.js"),
  TransactionController: require("./Transaction/transaction.controller.js"),
  StatisticsController: require("./Dashboard/Sale/statistics.controller.js")
};