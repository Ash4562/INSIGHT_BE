const mongoose = require("mongoose");

const SalarySchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    incentives: {
      type: String,
      default: "0",
    },
    deductions: {
      type: String,
      default: "0",
    },
    total_salary: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", SalarySchema);
