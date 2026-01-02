const VisitModel = require("../../models/visits.model");

const Student_DATA = [
  "student_details.student_name",
  "student_details.student_email",
  "student_details.student_contact",
];

const couns_VisitController = {
  async getMyVisitors(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      const getVisitors = await VisitModel.find({
        counsellor_assigned: counseller._id,
      }).populate("existing_student_id",Student_DATA);
      res.status(200).json({ message: "Success", data: getVisitors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    // 
  },
  async replyToVisit(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      const { id } = req.params;
      const { reply } = req.body;
      if (!id) {
        return res.status(400).json({ message: "Note id is required" });
      }
      const isVisitExists = await VisitModel.findOne({
        _id: id,
        counsellor_assigned: counseller._id,
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

module.exports = { couns_VisitController };
