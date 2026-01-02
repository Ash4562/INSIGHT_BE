const StudentModel = require("../../models/student.model");

const counseller_DATA = ["couns_name"];

const recept_StudentController = {
  async GetAllStudents(req, res) {
    try {
      const reception = req.reception;
      if (!reception) {
        return res.status(401).json({ message: "Reception is not valid" });
      }
      const getStudents = await StudentModel.find({
         payment_status: { $in: ["partial", "completed"] },
      })
        .populate({
          path: "added_by",
          select: counseller_DATA,
        })
        .populate({
          path: "course_details.preffered_course",
          select: "course",
        });

      res.status(200).json({ message: "Success", data: getStudents });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { recept_StudentController };
