const express = require("express");
const {
  Admin_Employee_Controller,
} = require("../../controllers/admin.controller/admin.employee.controller");

const admin_Employee_Router = express.Router();

admin_Employee_Router.post("/add/employee", Admin_Employee_Controller.addEmployee);
admin_Employee_Router.get("/get/employees", Admin_Employee_Controller.getEmployees);
admin_Employee_Router.delete("/delete/employee/:id", Admin_Employee_Controller.deleteEmployee);


module.exports = { admin_Employee_Router };
