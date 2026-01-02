const StudentModel = require("../../models/student.model");
const VisitModel = require("../../models/visits.model");
const CounsellerModel = require("../../models/counseller.model");
const AdminModel = require("../../models/admin.model");

const couns_Data = ["couns_name", "couns_email", "couns_contact"];
const student_data = [
  "student_details.student_name",
  "student_details.student_email",
  "student_details.student_contact",
];

const recep_VisitsController = {
  async ScheduleVisit(req, res) {
    try {
      const reception = req.reception;
      if (!reception) {
        return res.status(400).json({ message: "Reception is not valid" });
      }
      const {
        existing_student_id,
        student_name,
        student_contact,
        student_email,
        visit_date,
        visit_time,
        visit_purpose,
        counsellor_assigned,
        additional_notes,
        admin_assigned,
      } = req.body;

      let isStudentExists = null;
      if (existing_student_id) {
        isStudentExists = await StudentModel.findById(existing_student_id);
        if (!isStudentExists) {
          return res.status(400).json({ message: "Student does not exists" });
        }
      }
      if (student_email) {
        isStudentExists = await StudentModel.findOne({
          "student_details.student_email": student_email,
        });
        if (isStudentExists) {
          return res
            .status(400)
            .json({ message: "Student with this email already exists" });
        }
      }

      if (counsellor_assigned) {
        const isCounsellerExists = await CounsellerModel.findById(
          counsellor_assigned
        );
        if (!isCounsellerExists) {
          return res.status(400).json({ message: "Counseller is not valid" });
        }
      } else if (admin_assigned) {
        const admin = await AdminModel.findById(admin_assigned);
        if (!admin) {
          return res.status(400).json({ message: "Admin is not valid" });
        }
      } else {
        return res
          .status(400)
          .json({ message: "No Admin or Counseller Provided" });
      }

      const newVisit = new VisitModel({
        existing_student_id,
        student_name,
        student_contact,
        student_email,
        visit_date,
        visit_time,
        visit_purpose,
        counsellor_assigned: counsellor_assigned || null,
        admin_assigned: admin_assigned || null,
        additional_notes,
      });

      await newVisit.save();

      res.status(201).json({
        message: `Scheduled a visit`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async GetAllVisits(req, res) {
    try {
      const reception = req.reception;
      if (!reception) {
        return res.status(401).json({ message: "Reception is not valid" });
      }
      const visits = await VisitModel.find({})
        .populate("counsellor_assigned", couns_Data)
        .populate("existing_student_id", student_data);
      res.status(200).json({ message: "Success", data: visits });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getAllAdmin(req, res) {
    try {
      const reception = req.reception;
      if (!reception) {
        return res.status(400).json({ message: "Reception not found" });
      }
      const admins = await AdminModel.find({});
      admins.password = undefined;
      res.status(200).json({ message: "Success", data: admins });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { recep_VisitsController };
