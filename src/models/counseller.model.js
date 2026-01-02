const mongoose = require("mongoose");
const validator = require("validator");

const CounsellerSchema = new mongoose.Schema(
  {
    couns_name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 25,
    },
    couns_email: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    couns_contact: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 10,
    },
    course_type: {
      // type : mongoose.Schema.Types.ObjectId,
      type: String,
      required: true,
    },
    isLogin: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counseller", CounsellerSchema);
