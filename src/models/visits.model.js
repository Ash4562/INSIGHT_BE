const mongoose = require("mongoose");
const validator = require("validator");

const visitSchema = new mongoose.Schema(
  {
    existing_student_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Student",
    },
    student_name: {
      type: String,
      minLength: 4,
      maxLength: 30,
      default: null,
    },
    student_contact: {
      type: String,
      minLength: 10,
      maxLength: 10,
      default: null,
    },
    student_email: {
      type: String,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    visit_date: {
      type: String,
      required: true,
    },
    visit_time: {
      type: String,
      required: true,
    },
    visit_purpose: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 30,
    },
    counsellor_assigned: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Counseller",
    },
    admin_assigned: {
      type: mongoose.Schema.Types.ObjectId,
    },
    additional_notes: {
      type: String,
      maxLength: 1000,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed"],
      default: "Scheduled",
    },
    reply : {
      type : String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
