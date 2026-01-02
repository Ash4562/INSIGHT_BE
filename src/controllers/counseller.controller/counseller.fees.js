const CourseModel = require("../../models/fees.model");

const couns_FeesController = {
  async getCourses(req, res) {
    try {
      const cousnseller = req.counseller;
      if (!cousnseller) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const courses = await CourseModel.find({});
      res.status(200).json({ message: "Success", data: courses });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { couns_FeesController };
