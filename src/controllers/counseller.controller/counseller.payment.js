const { default: mongoose } = require("mongoose");
const StudentModel = require("../../models/student.model");
const uploadTheImage = require("../../utils/cloudinary");
const razorpayInstance = require("../../utils/razorpay");
const crypto = require("crypto");
const FeesModel = require("../../models/fees.model");

const couns_Payment_Controller = {
  // Online
  async makePartialPaymentPaid(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ error: "Counseller is not valid" });
      }

      const { amount } = req.body;
      const { s_id } = req.params;

      if (!amount || !s_id || Number(amount) <= 0) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const student = await StudentModel.findById(s_id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // if (student.fees_details.last_partial_order_id) {
      //   return res.status(400).json({
      //     message: "A partial payment is already in progress",
      //   });
      // }

      if (student.payment_status === "pending") {
        return res.status(400).json({
          message: "Previous payment is not completed",
        });
      }

      const total = Number(student.fees_details.total_fees.amount);
      const paid = Number(student.fees_details.paid_amount.amount);
      const due = Number(student.fees_details.partial_payment.amount);

      if (paid >= total) {
        return res.status(403).json({ message: "Total Fees is already paid" });
      }

      if (Number(amount) > due) {
        return res.status(400).json({ message: "Amount exceeds pending dues" });
      }

      const order = await razorpayInstance.orders.create({
        amount: Number(amount) * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      student.fees_details.last_partial_order_id = order.id;
      await student.save();

      return res.status(201).json({
        message: "Order created successfully!",
        order,
        public_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async verifyPartialPayment(req, res) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        s_id,
        amount,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !s_id ||
        !amount ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const student = await StudentModel.findById(s_id).populate(
        "course_details.preffered_course",
        "course"
      );
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (student.fees_details.last_partial_order_id !== razorpay_order_id) {
        return res.status(400).json({
          message: "Order does not belong to this student",
        });
      }

      const total = Number(student.fees_details.total_fees.amount);
      const paid = Number(student.fees_details.paid_amount.amount);
      const due = Number(student.fees_details.partial_payment.amount);

      if (paid >= total) {
        return res.status(403).json({ message: "Total Fees already paid" });
      }

      if (Number(amount) > due) {
        return res.status(400).json({ message: "Amount exceeds pending dues" });
      }

      const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest("hex");

      if (expectedSign !== razorpay_signature) {
        student.fees_details.last_partial_order_id = null;
        await student.save();
        return res.status(400).json({ message: "Payment verification failed" });
      }

      const alreadyExists = student.fees_details.installments.some(
        (i) => i.paymentKeys?.razorpay_payment_id === razorpay_payment_id
      );

      if (alreadyExists) {
        return res.status(400).json({ message: "Payment already recorded" });
      }

      student.fees_details.installments.push({
        amount: Number(amount),
        status: "paid",
        paymentKeys: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        payment_mode: "online",
      });

      student.fees_details.paid_amount.amount = paid + Number(amount);
      student.fees_details.partial_payment.amount = due - Number(amount);

      if (Number(student.fees_details.paid_amount.amount) === total) {
        student.payment_status = "completed";
        student.fees_details.total_fees.status = "paid";
        student.fees_details.paid_amount.status = "paid";
        student.fees_details.partial_payment.status = "paid";
      } else {
        student.payment_status = "partial";
      }

      student.fees_details.last_partial_order_id = null;
      await student.save();

      return res
        .status(200)
        .json({ message: "Partial payment successful", data: student });
    } catch (error) {
      student.fees_details.last_partial_order_id = null;
      return res.status(500).json({ error: error.message });
    }
  },
  // Offline
  async makePartialOfflinePayment(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }

      const { amount } = req.body;
      const { s_id } = req.params;

      if (!amount || Number(amount) <= 0 || !s_id) {
        return res
          .status(400)
          .json({ message: "Valid amount and student id required" });
      }

      const student = await StudentModel.findById(s_id).populate(
        "course_details.preffered_course",
        "course"
      );
      if (!student) {
        return res.status(404).json({ message: "Student does not exist" });
      }

      if (student.payment_status === "pending") {
        return res.status(400).json({
          message: "Previous payment is not cleared",
        });
      }

      if (student.payment_status === "completed") {
        return res.status(400).json({
          message: "Total fees already paid",
        });
      }

      const total = Number(student.fees_details.total_fees.amount);
      const paid = Number(student.fees_details.paid_amount.amount);
      const due = Number(student.fees_details.partial_payment.amount);
      const payAmount = Number(amount);

      if (payAmount > due) {
        return res.status(400).json({
          message: "Amount cannot exceed remaining dues",
        });
      }

      student.fees_details.paid_amount.amount = paid + payAmount;
      student.fees_details.partial_payment.amount = due - payAmount;

      student.fees_details.installments.push({
        amount: payAmount,
        status: "paid",
        payment_mode: "offline",
      });

      if (Number(student.fees_details.paid_amount.amount) === total) {
        student.payment_status = "completed";
        student.fees_details.total_fees.status = "paid";
        student.fees_details.paid_amount.status = "paid";
        student.fees_details.partial_payment.status = "paid";
      } else {
        student.payment_status = "partial";
        student.fees_details.total_fees.status = "partial";
        // student.fees_details.paid_amount.status = "partial";
        student.fees_details.partial_payment.status = "unpaid";
      }

      await student.save();

      return res.status(200).json({
        message: `₹${payAmount} paid successfully (offline)`,
        data: student,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async PostPartialReceiptByInstallmentId(req, res) {
    try {
      const { s_id, id } = req.params;

      if (!s_id || !id) {
        return res.status(400).json({
          error: "Student ID and Installment ID are required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(s_id) ||
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          error: "Invalid Student ID or Installment ID",
        });
      }

      const studentExists = await StudentModel.findOne({
        _id: s_id,
        "fees_details.installments._id": id,
      });

      if (!studentExists) {
        return res.status(404).json({
          error: "Student or installment not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Receipt image is required",
        });
      }

      const uploadResult = await uploadTheImage(req.file.buffer);
      const receiptUrl = uploadResult.secure_url;

      await StudentModel.updateOne(
        {
          _id: s_id,
          "fees_details.installments._id": id,
        },
        {
          $set: {
            "fees_details.installments.$.receipt": receiptUrl,
            "fees_details.installments.$.status": "paid",
          },
        }
      );

      return res.status(200).json({
        message: "Installment receipt uploaded successfully",
        receipt: receiptUrl,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  },

};

module.exports = { couns_Payment_Controller };
