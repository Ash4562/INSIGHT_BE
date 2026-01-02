const EmployeeModel = require("../../models/employee.model");
const SalaryModel = require("../../models/salary.slips.model");

const EMP_DATA = ["name", "role", "contact", "basic_salary"]

const adminSalaryController = {
  async GenerateSlip(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { employee_id } = req.body;
      if (!employee_id) {
        return res.status(400).json({ message: "Employee id is needed" });
      }
      const isEmployeeExists = await EmployeeModel.findById(employee_id);
      if (!isEmployeeExists) {
        return res.status(400).json({ message: "Employee does not exists" });
      }
      const { incentives, deductions, total_salary } = req.body;
      if (!total_salary) {
        return res.status(400).json({ message: "Total Salary is required" });
      }
      const slip = new SalaryModel({
        employee_id,
        incentives,
        deductions,
        total_salary,
      });

      await slip.save();
      res.status(201).json({
        message: `Salary slip successfully created for ${isEmployeeExists.name}`,
        slip: slip,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async GetSalarySlips(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const slips = await SalaryModel.find({}).populate('employee_id', EMP_DATA);
      res.status(200).json({ message: "Success", data: slips });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { adminSalaryController };
