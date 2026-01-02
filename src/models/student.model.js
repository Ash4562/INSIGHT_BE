const mongoose = require("mongoose");
const validator = require("validator");

const notes = new mongoose.Schema(
  {
    note: { type: String },
  },
  { timestamps: true }
);

const docs = new mongoose.Schema(
  {
    doc_type: { type: String },
    url: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const stageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: String, lowercase: true },
    status: {
      type: String,
      enum: ["completed", "pending"],
      default: "pending",
    },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const feeItemSchema = new mongoose.Schema({
  amount: {
    type: String,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["paid", "unpaid", "partial"],
    default: "unpaid",
  },
});

const installmentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
    },
    receipt: {
      type: String,
      default: "",
    },
    paymentKeys: {
      razorpay_order_id: { type: String },
      razorpay_payment_id: { type: String },
      razorpay_signature: { type: String },
    },
    payment_mode: {
      type: String,
      enum: ["offline", "online"],
      // required : true
    },
  },
  { timestamps: true }
);

const studentSchema = new mongoose.Schema(
  {
    student_details: {
      student_name: { type: String, required: true },
      student_email: {
        type: String,
        required: true,
        lowercase: true,
        validate: (v) => {
          if (!validator.isEmail(v)) throw new Error("Invalid email");
        },
      },
      student_contact: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 10,
      },
      cet_password: { type: String, required: true },

      father_name: { type: String, required: true },
      father_occupation: { type: String },
      father_contact: { type: String, required: true },

      mother_name: { type: String, required: true },
      mother_contact: { type: String },
      mother_occupation: { type: String },

      annual_family_income: { type: String, required: true },
    },

    course_details: {
      preffered_course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Fees",
      },
      stream: { type: String, required: true },
      hsc_percentage: { type: String, required: true },
      entrance_exam: { type: String, required: true },
      exam_score: { type: String, required: true },
      preferred_clg_loc: { type: String, required: true },
    },

    fees_details: {
      total_fees: {
        type: feeItemSchema,
        required: true,
      },

      paid_amount: {
        type: feeItemSchema,
        required: true,
      },

      installments: [installmentSchema],

      due_amount: {
        type: feeItemSchema,
        default: () => ({ amount: 0 }),
      },

      add_on_fees: [
        {
          course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Fees"
          },
          price: {
            type: String,
            default: "0",
          },
        },
      ],

      partial_payment: {
        type: feeItemSchema,
        default: () => ({ amount: 0 }),
      },

      isOnlinePayment: {
        type: Boolean,
        // required: true,
        default: false,
      },

      isPartialPayment: {
        type: Boolean,
        // required: true,
      },
      last_partial_order_id: {
        type: String,
      },
      initial_reg_receipt: {
        type: String,
      },
      offer_price: {
        type: String,
        default: "0",
      },
    },

    doc_details: [docs],

    admission_process: {
      type: [stageSchema],
      default: () => [
        { name: "counselling", status: "completed" },
        { name: "admission_to_insight", status: "completed" },
        { name: "registeration_to_insight", status: "completed" },
        { name: "doc_verification", status: "pending" },
        { name: "college_shortlisting", status: "pending" },
        { name: "r1_allotment", status: "pending" },
        { name: "r2_allotment", status: "pending" },
        { name: "r3_allotment", status: "pending" },
        { name: "r4_allotment", status: "pending" },
        { name: "final_seat_confirmation", status: "pending" },
        { name: "fee_payment", status: "pending" },
        { name: "admission_to_college", status: "pending" },
      ],
    },
    notes: [notes],
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Counseller",
    },

    uniqueId: {
      type: String,
      required: true,
    },

    payment_status: {
      type: String,
      enum: ["pending", "completed", "partial"],
      // required: true,
    },
    razorpay_order_id: {
      type: String,
      default: "",
    },
    razorpay_payment_id: {
      type: String,
      default: "",
    },
    razorpay_signature: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

studentSchema.index(
  { "student_details.student_email": 1 },
  {
    unique: true,
    partialFilterExpression: {
      payment_status: "completed",
    },
  }
);

module.exports = mongoose.model("Student", studentSchema);
