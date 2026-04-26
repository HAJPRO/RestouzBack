// services/index.js

module.exports = {
  AuthService: require("./Auth/auth.service.js"),
  ZoneService: require("./Zone/zone.service.js"),
  CustomerService: require("./customer/customer.service.js"),
  DepartmentService: require("./hr/department/department.service.js"),
  EmployeeService: require("./hr/employee/employee.service.js"),
  MenuService: require("./menu/menu.service.js"),
  OrderService: require("./order/order.service.js"),
  PermissionService: require("./settings/permission/permission.service.js"),
  RoleService: require("./settings/role/role.service.js"),
  UserService: require("./settings/users/user.service.js"),
  FeeService: require("./settings/service/fee.service.js"),
  TabelService: require("./tabel/tabel.service.js"),
  TransactionService: require("./transaction/transaction.service.js"),
  StatisticsService: require("./Dashboard/Sale/statistics.service.js")
};