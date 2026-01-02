const { findById } = require("../../models/student.model");
const VisitModel = require("../../models/visits.model");

const Student_DATA = [
  "student_details.student_name",
  "student_details.student_email",
  "student_details.student_contact",
];

const admin_Visit_Controller = {
  async getMyVisitRequest(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(400).json({ message: "Admin is not valid" });
      }
      const requests = await VisitModel.find({
        admin_assigned: admin._id,
      }).populate("existing_student_id", Student_DATA);
      res.status(200).json({ message: "Success", data: requests });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async replyToVisit(req, res) {
    console.log("VISITS ROUTE HIT");
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(400).json({ message: "Admin is not valid" });
      }
      const { id } = req.params;
      const { reply } = req.body;
      if (!id) {
        return res.status(400).json({ message: "Note id is required" });
      }
      const isVisitExists = await VisitModel.findOne({
        _id: id,
        admin_assigned: admin._id,
      });
      if (!isVisitExists) {
        return res.status(400).json({ message: "Visit does not exists" });
      }
      isVisitExists.reply = reply;
      isVisitExists.status = "Completed";
      await isVisitExists.save();
      res.status(201).json({ message: "Replied to note successfully." });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { admin_Visit_Controller };
