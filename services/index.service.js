// services/index.js

module.exports = {
  AuthService: require("./Auth/auth.service.js"),
  ZoneService: require("./Zone/zone.service.js"),
  CustomerService: require("./Customer/customer.service.js"),
  DepartmentService: require("./HR/Department/department.service.js"),
  EmployeeService: require("./HR/Employee/employee.service.js"),
  MenuService: require("./Menu/menu.service.js"),
  OrderService: require("./Order/order.service.js"),
  PermissionService: require("./Settings/permission/permission.service.js"),
  RoleService: require("./Settings/role/role.service.js"),
  UserService: require("./Settings/users/user.service.js"),
  FeeService: require("./Settings/service/fee.service.js"),
  TabelService: require("./Tabel/tabel.service.js"),
  TransactionService: require("./Transaction/transaction.service.js"),
  StatisticsService: require("./Dashboard/Sale/statistics.service.js")
};