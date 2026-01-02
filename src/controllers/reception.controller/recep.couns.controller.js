const CounsellerModel = require("../../models/counseller.model");

const recep_counsController = {
  async getAllCounsellers(req, res) {
    try {
      const reception = req.reception;
      if (!reception) {
        return res.status(401).json({ message: "Reception is not valid" });
      }
      const counses = await CounsellerModel.find({});
      res.status(200).json({ message: "Success", data: counses });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { recep_counsController };
