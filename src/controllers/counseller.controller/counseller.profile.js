
const CounsellerModel = require("../../models/counseller.model");

const couns_Profile = {
  async EditProfile(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      const { couns_name, couns_email, couns_contact } = req.body;

      const updatedData = await CounsellerModel.findByIdAndUpdate(
        counseller._id,
        {
          couns_name,
          couns_email,
          couns_contact,
        },
        { new: true }
      );
      res
        .status(201)
        .json({ message: "Data Updated", updatedData: updatedData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { couns_Profile };
