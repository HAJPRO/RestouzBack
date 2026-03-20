const EmployeeManagmentService = require("../../../services/HR/employee/employee.service");
class EmployeeManagmentController {
    async Create(req, res, next) {
        try {
            const data = await EmployeeManagmentService.Create(req,req.body);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    async GetAll(req, res, next) {
        try {
            const data = await EmployeeManagmentService.GetAll(req,req.body);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    async DeleteById(req, res, next) {
        try {
            const data = await EmployeeManagmentService.DeleteById(req,req.body);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }

    }
    async GetById(req, res, next) {
        try {
            const data = await EmployeeManagmentService.GetById(req,req.body);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }

    }
    async GetOrdersByDriverId(req, res, next) {
        try {
            const data = await EmployeeManagmentService.GetOrdersByDriverId(req,req.body);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }

    }




}

module.exports = new EmployeeManagmentController();
