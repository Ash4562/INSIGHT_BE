const mongoose = require("mongoose");
const validator = require('validator');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      minLength: 5,
      trim: true,
      lowercasee: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not string");
        }
      },
    },
    contact: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
