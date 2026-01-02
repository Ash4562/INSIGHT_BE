const express = require('express');
const { adminSalaryController } = require('../../controllers/admin.controller/admin.salary.controller');
const admin_SalaryRouter = express.Router();

admin_SalaryRouter.post('/generate', adminSalaryController.GenerateSlip);
admin_SalaryRouter.get('/get/slips', adminSalaryController.GetSalarySlips);

module.exports = admin_SalaryRouter;