const EmployeeModel = require("../../models/employee.model");

const Admin_Employee_Controller = {
  async addEmployee(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { name, role, contact, basic_salary } = req.body;
      if (!name || !role || !contact || !basic_salary) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isEmpExists = await EmployeeModel.findOne({ contact });
      if (isEmpExists) {
        return res.status(400).json({ message: "Employee already exists" });
      }
      const newEmp = await EmployeeModel({
        name,
        role,
        contact,
        basic_salary,
      });

      await newEmp.save();
      res
        .status(201)
        .json({ message: `Successfully added the employee ${name}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getEmployees(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const employees = await EmployeeModel.find({});
      res.status(200).json({ message: "Success", data: employees });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteEmployee(req, res){
    try {
      const admin = req.admin;
      if(!admin){
        res.status(401).json({message : "Admin is not valid"});
      }
      const {id} = req.params;
      if(!id){
        return res.status(400).json({message : "All fields are required"});
      }
      const isEmpExists = await EmployeeModel.findByIdAndDelete(id);
      if(!isEmpExists){
        return res.status(400).json({message : "Employee does not exists"});
      }
     res.status(200).json({message : "Successfully deleted employee"})
    } catch (error) {
      res.status(500).json({error : error.message});
    }
  }
};

module.exports = { Admin_Employee_Controller };
