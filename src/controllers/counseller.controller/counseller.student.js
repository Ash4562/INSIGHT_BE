const StudentModel = require("../../models/student.model");
const cloudinary = require("../../utils/cloudinary");
const handleCloudinaryUploads = require("../../helpers/handleCloudinary");
const uploadTheImage = require("../../utils/cloudinary");
const FeesModel = require("../../models/fees.model");
const VisitModel = require("../../models/visits.model");
const razorpayInstance = require("../../utils/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Counter = require("../../models/counter.schema");
const FIELD_MAP = {
  student_name: "student_details.student_name",
  student_email: "student_details.student_email",
  student_contact: "student_details.student_contact",
  father_name: "student_details.father_name",
  father_occupation: "student_details.father_occupation",
  father_contact: "student_details.father_contact",
  mother_name: "student_details.mother_name",
  mother_contact: "student_details.mother_contact",
  mother_occupation: "student_details.mother_occupation",
  annual_family_income: "student_details.annual_family_income",

  preffered_course: "course_details.preffered_course",
  stream: "course_details.stream",
  hsc_percentage: "course_details.hsc_percentage",
  preferred_clg_loc: "course_details.preferred_clg_loc",
  entrance_exam: "course_details.entrance_exam",
  exam_score: "course_details.exam_score",

  // fees_details: "fees_details",

  aadhar: "doc_details.aadhar",
  passport: "doc_details.passport",
};
const mapFlatToNested = (body) => {
  const updateObj = {};
  for (const key in body) {
    if (FIELD_MAP[key]) {
      updateObj[FIELD_MAP[key]] = body[key];
    }
  }
  return updateObj;
};

const Student_DATA = [
  "student_details.student_name",
  "student_details.student_email",
  "student_details.student_contact",
];

const counStudentController = {
  async offlineAddingStudent(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const student_details = JSON.parse(req.body.student_details);
      const course_details = JSON.parse(req.body.course_details);
      const fees_details = JSON.parse(req.body.fees_details);
      const offer_price = Number(fees_details.offer_price) || 0;

      const completedStudent = await StudentModel.findOne({
        "student_details.student_email": student_details.student_email,
        payment_status: "completed",
      });

      if (completedStudent) {
        return res.status(400).json({ message: "Student already exists" });
      }

      const course = await FeesModel.findById(course_details.preffered_course);
      if (!course) {
        return res.status(400).json({ message: "Course doesn't exists" });
      }

      const uploadedDocs = await handleCloudinaryUploads(req.files);
      const doc_details = Object.keys(uploadedDocs).map((key) => ({
        doc_type: key,
        url: uploadedDocs[key],
        status: "pending",
      }));

      // Id Logic
      let course_init = "";
      const courseName = course.course.toLowerCase();

      if (courseName.includes("mba")) course_init = "MBA";
      else if (courseName.includes("engineering")) course_init = "ER";
      else if (courseName.includes("medical")) course_init = "MED";
      else return res.status(400).json({ message: "Invalid Course" });

      const year = new Date().getFullYear().toString().slice(-2);
      const prefix = `${course_init}${year}`;

      const lastStudent = await StudentModel.findOne({
        uniqueId: { $regex: `${year}` },
      })
        .sort({ uniqueId: -1 })
        .select("uniqueId");

      let nextNumber = 101;

      if (lastStudent) {
        const numericPart = parseInt(lastStudent.uniqueId.slice(-3), 10);
        nextNumber = numericPart + 1;
      }

      const uniqueId = `${prefix}${String(nextNumber).padStart(3, "0")}`;
      // Id Logic

      let total = Number(fees_details.total_fees.amount);
      const initialPay = Number(fees_details.paid_amount.amount);
      let remainingAmount =
        Number(fees_details.total_fees.amount) -
        Number(fees_details.paid_amount.amount);

      if (Number(fees_details.offer_price) > 0) {
        total =
          Number(fees_details.total_fees.amount) -
          Number(fees_details.offer_price);
      }

      let StatusBeStatus = "";
      let statusForMainStatus = "";

      console.log("total", total);
      console.log("initialPay", initialPay);

      let remainStatus = "";
      if (remainingAmount !== 0) {
        remainStatus = "unpaid";
      } else {
        remainStatus = "paid";
      }

      const installments = [];

      if (initialPay > 0) {
        installments.push({
          amount: initialPay,
          status: "paid",
          // payment_mode: "online",
        });
      }

      if (
        Array.isArray(fees_details.add_on_fees) &&
        fees_details.add_on_fees.length > 0
      ) {
        for (const addOn of fees_details.add_on_fees) {
          if (!addOn.course_id || !addOn.price) {
            return res.status(400).json({ message: "Invalid add-on fee data" });
          }

          const isCourseExists = await FeesModel.findOne({
            _id: course_details.preffered_course,
            "streams._id": new mongoose.Types.ObjectId(addOn.course_id),
          });

          if (!isCourseExists) {
            return res.status(400).json({
              message:
                "Add-on stream does not exist, Or maybe does not belong to its course ",
            });
          }

          total += Number(addOn.price);
          // if(total > initialPay){
          //   statusForMainStatus = "partial"
          // } else if(total > initialPay)
        }
      }

      console.log("total", total);

      if (initialPay < total) {
        StatusBeStatus = "partial";
        statusForMainStatus = "partial";
      } else if (initialPay === total) {
        StatusBeStatus = "paid";
        statusForMainStatus = "completed";
      } else {
        StatusBeStatus = "pending";
        statusForMainStatus = "pending";
      }

      remainingAmount = total - Number(fees_details.paid_amount.amount);
      // console.log("total from offline", total);
      // console.log("initialPay from offline", initialPay);

      console.log("remainingAmount", remainingAmount);

      if (remainingAmount < 0) {
        return res
          .status(400)
          .json({ message: "Remaining amount can't be less that zero" });
      }

      const preparedFees = {
        total_fees: {
          amount: total,
          status: total === initialPay ? "paid" : "partial",
        },
        paid_amount: { amount: initialPay, status: "paid" },
        partial_payment: {
          amount: remainingAmount,
          status: remainingAmount ? "unpaid" : "paid",
        },
        add_on_fees: fees_details.add_on_fees || [],
        installments,
        isPartialPayment: initialPay < total,
        isOnlinePayment: "false",
        offer_price,
      };

      const student = new StudentModel({
        student_details,
        course_details,
        fees_details: preparedFees,
        doc_details,
        uniqueId,
        razorpay_order_id: "",
        razorpay_payment_id: "",
        razorpay_signature: "",
        added_by: counseller._id,
        payment_status: statusForMainStatus,
      });

      await student.save();

      await student.populate(
        "course_details.preffered_course",
        "course streams"
      );

      return res.status(201).json({
        message: "Student created successfully!",
        data: student,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async AddStudent(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }

      const student_details = JSON.parse(req.body.student_details);
      const course_details = JSON.parse(req.body.course_details);
      const fees_details = JSON.parse(req.body.fees_details);
      const offer_price = Number(fees_details.offer_price) || 0;

      const completedStudent = await StudentModel.findOne({
        "student_details.student_email": student_details.student_email,
        payment_status: "completed",
      });

      if (completedStudent) {
        return res.status(400).json({ message: "Student already exists" });
      }

      const course = await FeesModel.findById(course_details.preffered_course);
      if (!course) {
        return res.status(400).json({ message: "Course doesn't exists" });
      }

      const uploadedDocs = await handleCloudinaryUploads(req.files);
      const doc_details = Object.keys(uploadedDocs).map((key) => ({
        doc_type: key,
        url: uploadedDocs[key],
        status: "pending",
      }));

      // Id Logic
      let course_init = "";
      const courseName = course.course.toLowerCase();

      if (courseName.includes("mba")) course_init = "MBA";
      else if (courseName.includes("engineering")) course_init = "ER";
      else if (courseName.includes("medical")) course_init = "MED";
      else return res.status(400).json({ message: "Invalid Course" });

      const year = new Date().getFullYear().toString().slice(-2);
      const prefix = `${course_init}${year}`;

      const lastStudent = await StudentModel.findOne({
        uniqueId: { $regex: `${year}` },
      })
        .sort({ uniqueId: -1 })
        .select("uniqueId");

      let nextNumber = 101;

      if (lastStudent) {
        const numericPart = parseInt(lastStudent.uniqueId.slice(-3), 10);
        nextNumber = numericPart + 1;
      }

      const uniqueId = `${prefix}${String(nextNumber).padStart(3, "0")}`;

      // Id Logic

      let total = Number(fees_details.total_fees.amount);
      const initialPay = Number(fees_details.paid_amount.amount);
      let remainingAmount =
        Number(fees_details.total_fees.amount) -
        Number(fees_details.paid_amount.amount);

      if (Number(fees_details.offer_price) > 0) {
        total =
          Number(fees_details.total_fees.amount) -
          Number(fees_details.offer_price);
      }

      if (
        Array.isArray(fees_details.add_on_fees) &&
        fees_details.add_on_fees.length > 0
      ) {
        for (const addOn of fees_details.add_on_fees) {
          if (!addOn.course_id || !addOn.price) {
            return res.status(400).json({ message: "Invalid add-on fee data" });
          }

          const isCourseExists = await FeesModel.findOne({
            _id: course_details.preffered_course,
            "streams._id": new mongoose.Types.ObjectId(addOn.course_id),
          });

          if (!isCourseExists) {
            return res
              .status(400)
              .json({ message: "Add-on course does not exist" });
          }

          total += Number(addOn.price);
        }
      }

      remainingAmount = total - Number(fees_details.paid_amount.amount);

      let StatusBeStatus = "";
      let statusForMainStatus = "";

      console.log("total", total);
      console.log("initialPay", initialPay);

      if (initialPay < total) {
        StatusBeStatus = "partial";
        statusForMainStatus = "partial";
      } else if (initialPay === total) {
        StatusBeStatus = "paid";
        statusForMainStatus = "completed";
      } else {
        StatusBeStatus = "pending";
        statusForMainStatus = "pending";
      }

      // console.log("StatusBeStatus : " ,StatusBeStatus)

      const preparedFees = {
        total_fees: {
          amount: total,
          status: StatusBeStatus,
          // payment_mode: "online",
        },
        paid_amount: { amount: initialPay, status: "unpaid" },
        partial_payment: {
          amount: remainingAmount,
          status: remainingAmount ? "unpaid" : "paid",
        },
        installments: [],
        isPartialPayment: initialPay < total,
        isOnlinePayment: true,
        add_on_fees: fees_details.add_on_fees || [],
        offer_price,
      };

      const order = await razorpayInstance.orders.create({
        amount: initialPay * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const student = await StudentModel.findOneAndUpdate(
        {
          "student_details.student_email": student_details.student_email,
          payment_status: "pending",
        },
        {
          $set: {
            student_details,
            course_details,
            fees_details: preparedFees,
            doc_details,
            uniqueId,
            razorpay_order_id: order.id,
            razorpay_payment_id: "",
            razorpay_signature: "",
            added_by: counseller._id,
            payment_status: "pending",
          },
        },
        { upsert: true, new: true }
      );

      return res.status(201).json({
        message: "Order created successfully!",
        order,
        key_id: process.env.RAZORPAY_KEY_ID,
        data: student,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async verifyPayment(req, res) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        s_id,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !s_id
      ) {
        return res.status(400).json({
          success: false,
          message: "All Razorpay payment fields are required",
        });
      }

      const student = await StudentModel.findOne({
        _id: s_id,
        razorpay_order_id,
        payment_status: "pending",
      }).populate("course_details.preffered_course", "course streams");

      if (!student) {
        return res.status(400).json({
          error: "Student not found or payment already processed",
        });
      }

      const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest("hex");

      if (expectedSign !== razorpay_signature) {
        await StudentModel.findByIdAndDelete(s_id);
        return res.status(400).json({
          message: "Payment verification failed, student removed",
        });
      }

      const total = Number(student.fees_details.total_fees.amount);
      const orderAmount = Number(student.fees_details.paid_amount.amount);

      student.fees_details.installments.push({
        amount: orderAmount,
        status: "paid",
        // payment_mode: "online",
        // paymentKeys: {
        //   razorpay_order_id,
        //   razorpay_payment_id,
        //   razorpay_signature,
        // },
      });

      student.fees_details.paid_amount.status = "paid";
      // student.fees_details.partial_payment.amount =
      //   total - student.fees_details.paid_amount.amount;

      if (Number(student.fees_details.paid_amount.amount) === total) {
        student.payment_status = "completed";
        student.fees_details.total_fees.status = "paid";
        student.fees_details.partial_payment.status = "paid";
      } else {
        student.payment_status = "partial";
        // student.fees_details.total_fees.status = "partial";
      }

      student.razorpay_payment_id = razorpay_payment_id;
      student.razorpay_signature = razorpay_signature;

      await student.save();

      return res.status(200).json({
        message: "Payment verified and student updated successfully",
        student,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async UpdateStudent(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Student id is required" });
      }
      const isStudentExists = await StudentModel.findById(id);
      if (!isStudentExists) {
        return res.status(400).json({ message: "Student is not valid" });
      }
      const updateFields = mapFlatToNested(req.body);

      const uploadedDocs = await handleCloudinaryUploads(req.files);

      const updateOperations = { ...updateFields };

      if (uploadedDocs && Object.keys(uploadedDocs).length > 0) {
        for (const doc_type in uploadedDocs) {
          const url = uploadedDocs[doc_type];

          updateOperations.$push = updateOperations.$push || {};

          updateOperations.$push.doc_details = {
            doc_type,
            url,
            status: "pending",
          };
        }
      }

      // Update student
      const updatedStudent = await StudentModel.findByIdAndUpdate(
        id,
        updateOperations,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        message: "Student updated successfully",
        student: updatedStudent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  async DeleteStudent(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Id is required" });
      }
      const isStudentExists = await StudentModel.findByIdAndDelete(id);
      if (!isStudentExists) {
        return res.status(400).json({ message: "Student does not exists" });
      }
      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getStudents(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller not valid" });
      }
      const students = await StudentModel.find({
        payment_status: { $in: ["partial", "completed"] },
        added_by: counseller._id,
      }).populate("course_details.preffered_course", "course fees streams");
      res.status(200).json({ message: "Success", data: students });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async addNoteToStudent(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const { id } = req.params;
      const { note } = req.body;
      if (!id) {
        return res.status(400).json({ message: "Student id is required" });
      }
      const isStudentExists = await StudentModel.findById(id);
      if (!isStudentExists) {
        return res.status(401).json({ message: "Student is not valid" });
      }
      isStudentExists.notes.push({ note });
      await isStudentExists.save();
      res.status(201).json({
        message: `Note added for ${isStudentExists.student_details.student_name} `,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async editNote(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      const { s_id, n_id } = req.params;
      const { newNote } = req.body;
      if (!s_id || !n_id) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!newNote || typeof newNote !== "string") {
        return res.status(400).json({ message: "Note text is required" });
      }

      const student = await StudentModel.findById(s_id);
      if (!student) {
        return res.status(400).json({ message: "Student does not exists" });
      }

      const noteDoc = student.notes.id(n_id);
      if (!noteDoc) {
        return res.status(400).json({ message: "Note is not valid" });
      }

      if (typeof noteDoc.note !== "string") {
        noteDoc.note = "";
      }

      // Update note
      noteDoc.note = newNote;

      // Save parent doc
      await student.save();

      res.status(200).json({ message: "Successfully edited" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteNote(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const { s_id, n_id } = req.params;
      if (!s_id || !n_id) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const isStudentExists = await StudentModel.findById(s_id);

      if (!isStudentExists) {
        return res.status(400).json({ message: "Student does not exists" });
      }

      await StudentModel.findByIdAndUpdate(s_id, {
        $pull: { notes: { _id: n_id } },
      });

      return res.status(200).json({ message: "Note deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getNotes(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const notes = await StudentModel.find({}, { notes: 1, _id: 0 });
      res.status(200).json({ message: "Success", data: notes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async approveOrRejectStudentDocs(req, res) {
    try {
      const { s_id, d_id, status } = req.params;

      if (!s_id || !d_id) {
        return res
          .status(400)
          .json({ message: "Student id and doc id required" });
      }

      const student = await StudentModel.findById(s_id);

      if (!student) {
        return res.status(404).json({ message: "Student does not exist" });
      }

      const doc = student.doc_details.find((d) => d._id.toString() === d_id);

      if (!doc) {
        return res.status(404).json({ message: "Document does not exist" });
      }

      if (status === "approve") {
        doc.status = "approved";
      } else {
        doc.status = "rejected";
      }

      await student.save();

      return res.status(200).json({
        message: "Document status updated",
        student,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },
  async markAdmissionStepCompleted(req, res) {
    try {
      const { s_id, step_id } = req.params;
      if (!s_id || !step_id) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isStudentExists = await StudentModel.findById(s_id);
      if (!isStudentExists) {
        return res.status(400).json({ message: "Student is not valid" });
      }
      const step = isStudentExists.admission_process.find(
        (p) => p._id == step_id
      );

      if (step.status === "completed") {
        return res.status(400).json({ message: "Already marked as completed" });
      }
      step.status = "completed";
      isStudentExists.save();
      res
        .status(200)
        .json({ message: `${step.name} has been marked as completed` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async uploadRegistrationImage(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller does not exists" });
      }
      const { s_id, step_id } = req.params;

      if (!s_id || !step_id) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const student = await StudentModel.findById(s_id);
      if (!student) {
        return res.status(400).json({ message: "Student is invalid" });
      }

      const step = student.admission_process.id(step_id);

      if (!step) {
        return res.status(400).json({ message: "Step does not exist" });
      }

      let uploadedImageURL = null;
      if (req.file) {
        const uploadResult = await uploadTheImage(req.file.buffer);
        uploadedImageURL = uploadResult.secure_url;
      }

      if (uploadedImageURL) {
        step.image = uploadedImageURL;
      }

      await student.save();

      res.status(201).json({
        message: "Receipt Uploaded Successfully",
        image: uploadedImageURL,
      });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ message: err.message });
    }
  },
  async getMyAddedStudents(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const getStudents = await StudentModel.find({
        added_by: counseller._id,
      }).select({
        // fees_details: 0,
        doc_details: 0,
        course_details: 0,
        notes: 0,
      });
      // .populate("fees_details.add_on_fees.course_id", "")
      res.status(200).json({ message: "Success", data: getStudents });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async uploadDoc(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }

      const { s_id } = req.params;
      const { doc_type } = req.body;

      if (!s_id || !doc_type) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const student = await StudentModel.findById(s_id);

      if (!student) {
        return res.status(400).json({ message: "Student not found" });
      }

      // Upload
      let uploadedURL = null;
      if (req.file) {
        const result = await uploadTheImage(req.file.buffer);
        uploadedURL = result.secure_url;
      }

      // Push new document
      student.doc_details.push({
        doc_type,
        url: uploadedURL,
        status: "pending",
      });

      await student.save();

      return res.status(200).json({
        message: "Document added successfully",
        student,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async markFeesStatusCompleted(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      const { s_id, f_id } = req.params;
      if (!s_id || !f_id) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isStudentExist = await StudentModel.findById(s_id);
      if (!isStudentExist) {
        return res.status(400).json({ message: "Student is not valid" });
      }
      const feeDetails = isStudentExist.fees_details;
      let selectedFee = null;

      for (let key in feeDetails) {
        if (feeDetails[key] && feeDetails[key]._id == f_id) {
          selectedFee = feeDetails[key];
          break;
        }
      }

      if (!selectedFee) {
        return res.status(404).json({ message: "Fee not found" });
      }

      selectedFee.status = "completed";
      await isStudentExist.save();

      res.status(200).json({ message: "Status updated" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async postInitialRegFees(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const { s_id } = req.params;
      if (!s_id) {
        return res.status(400).json({ message: "Student id is required" });
      }
      const isStudentExists = await StudentModel.findById(s_id);
      if (!isStudentExists) {
        return res.status(400).json({ message: "Student does not exists" });
      }

      let initial_reg_receipt = null;
      if (req.file) {
        const uploadResult = await uploadTheImage(req.file.buffer);
        initial_reg_receipt = uploadResult.secure_url;
      }

      if (initial_reg_receipt) {
        isStudentExists.fees_details.initial_reg_receipt = initial_reg_receipt;
        await isStudentExists.save();
      }
      res.status(201).json({ message: "Successfully posted receipt" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getVisitsByStudentId(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Student id is required" });
      }
      const isStudentExist = await StudentModel.findById(id);
      if (!isStudentExist) {
        return res.status(400).json({ message: "Student does not exists" });
      }
      const getVisits = await VisitModel.findOne({
        existing_student_id: id,
      }).populate("existing_student_id", Student_DATA);
      return res.status(200).json({ message: "Success", data: getVisits });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async AddExternalAddOnStream(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      const { s_id } = req.params;
      const { stream_id, price } = req.body;
      if (!s_id || !stream_id) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (Number(price) <= 0) {
        return res.status(400).json({ message: "Invalid price" });
      }
      const isStudentExist = await StudentModel.findById(s_id);
      if (!isStudentExist) {
        return res.status(400).json({ message: "Student does not exists" });
      }
      const isStreamExists = await FeesModel.findOne({
        _id: isStudentExist.course_details.preffered_course,
        "streams._id": stream_id,
      });
      if (!isStreamExists) {
        return res.status(400).json({
          message:
            "Stream does not exists, or maybe it does not belong to the selected course",
        });
      }

      const isAlreadyAdded = isStudentExist.fees_details.add_on_fees.some(
        (fee) => fee.course_id.toString() === stream_id
      );

      if (isAlreadyAdded) {
        return res.status(400).json({
          message: "This stream is already added for the student",
        });
      }

      isStudentExist.fees_details.add_on_fees.push({
        course_id: stream_id,
        price: price,
      });

      isStudentExist.fees_details.total_fees.amount =
        Number(isStudentExist.fees_details.total_fees.amount) + Number(price);
      isStudentExist.fees_details.partial_payment.amount =
        Number(isStudentExist.fees_details.partial_payment.amount) +
        Number(price);

      let total = Number(isStudentExist.fees_details.total_fees.amount);
      let paid = Number(isStudentExist.fees_details.paid_amount.amount);

      let totalStatus = isStudentExist.fees_details.total_fees.status;

      if (
        totalStatus === "paid" &&
        isStudentExist.payment_status === "completed"
      ) {
        isStudentExist.fees_details.total_fees.status = "partial";
        isStudentExist.fees_details.partial_payment.status = "unpaid";
        isStudentExist.payment_status = "partial";
      }

      await isStudentExist.save();
      return res.status(200).json({
        message: `Stream Added for ${isStudentExist.student_details.student_name} `,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { counStudentController };
