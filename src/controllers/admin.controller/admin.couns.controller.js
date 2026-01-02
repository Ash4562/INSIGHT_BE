const CounsellerModel = require("../../models/counseller.model");
const VisitsModel = require("../../models/visits.model");

const Student_DATA = [
  "student_details.student_name",
  "student_details.student_email",
  "student_details.student_contact",
];

const adminCounsController = {
  async AddCounseller(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { couns_name, couns_email, couns_contact, course_type } = req.body;
      if (!couns_contact || !couns_email || !couns_name || !course_type) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isCounsExists = await CounsellerModel.findOne({ couns_email });
      if (isCounsExists) {
        return res.status(400).json({ message: "Counseller already exists" });
      }
      const couns = new CounsellerModel({
        couns_email,
        couns_name,
        couns_contact,
        course_type,
      });
      await couns.save();
      res.status(201).json({ message: "Success", data: couns });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async GetAllCounseller(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const counsellers = await CounsellerModel.find({});
      res.status(200).json({ message: "Success", data: counsellers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteController(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { couns_id } = req.params;
      if (!couns_id) {
        return res.status(400).json({ message: "Counseller id is required" });
      }
      const isCounsExists = await CounsellerModel.findByIdAndDelete(couns_id);
      if (!isCounsExists) {
        return res.status(400).json({ message: "Counseller does not exists" });
      }
      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getVisitsbyCounsellerId(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isCounsExists = await CounsellerModel.findById(id);
      if (!isCounsExists) {
        return res.status(400).json({ message: "Counseller does not exists" });
      }
      const visits = await VisitsModel.findOne({
        counsellor_assigned: id,
      }).populate("existing_student_id", Student_DATA);
      res.status(200).json({ message: "Success", visits });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async getAllVisit(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(400).json({ error: "Admin is not valid" });
      }
      const visits = await VisitsModel.find({}).populate(
        "existing_student_id",
        Student_DATA
      );
      res.status(200).json({ message: "Success", data: visits });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteVisitById(req, res) {
    try {
      const { v_id } = req.params;
      if (!v_id) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isVisitExists = await VisitsModel.findByIdAndDelete(v_id);
      if (!isVisitExists) {
        return res.status(400).json({ message: "Visit does not exists" });
      }
      return res.status(200).json({ message: "Visit deleted successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
module.exports = { adminCounsController };
