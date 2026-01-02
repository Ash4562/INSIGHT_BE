const mongoose = require("mongoose");
const validator = require("validator");
const receptionSchema = new mongoose.Schema(
  {
    reception_name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 25,
    },
    reception_email: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    reception_contact: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 10,
    },
  },
  { timestamps: true }
);

receptionSchema.index({ reception_email: 1 }, { unique: true });

module.exports = mongoose.model("Reception", receptionSchema);
