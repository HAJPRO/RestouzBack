const {UserService} = require("../../../services/index.service");

class UserController {
  async createUser(req, res, next) {
    try {
      const data = await UserService.CreateUser(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async UpdateUser(req, res, next) {
    try {
      const data = await UserService.UpdateUser(req,req.body);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  async GetUsers(req, res, next) {
    console.log(req.body)
    try {
      const users = await UserService.GetUsers(req,req.body);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
  async GetOneUser(req, res, next) {
    try {
      const user = await UserService.GetOneUser(req,req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
  async GetRoles(req, res, next) {
    try {
      const roles = await UserService.GetRoles(req);
      res.status(200).json(roles);
    } catch (error) {
      next(error);
    }
  }
  async GetPermissions(req, res, next) {
    try {
      const permissions = await UserService.GetPermissions(req);
      res.status(200).json(permissions);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
