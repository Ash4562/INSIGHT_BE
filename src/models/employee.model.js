const mongoose = require("mongoose");
const validator = require("validator");

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 30,
    },
    role: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
      maxLength: 10,
      minLength: 10,
    },
    basic_salary: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
