const FeesModel = require("../../models/fees.model");
const StudentModel = require("../../models/student.model");

const admin_Fess_Controller = {
  async addFees(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }

      const { course, streams } = req.body;

      if (!course || !Array.isArray(streams) || streams.length === 0) {
        return res
          .status(400)
          .json({ message: "Course and streams are required" });
      }

      for (const stream of streams) {
        if (!stream.stream_name || !stream.stream_fees) {
          return res
            .status(400)
            .json({ message: "Each stream must have name and fees" });
        }
      }

      const newFees = new FeesModel({
        course,
        streams,
        // add_on_price,
      });

      await newFees.save();

      return res.status(201).json({
        message: "Fees added successfully",
        data: newFees,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async getFees(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const allfees = await FeesModel.find({});
      res.status(200).json({ message: "Success", data: allfees });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async editFees(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { id } = req.params;
      const { course, fees } = req.body;
      const isCourseExists = await FeesModel.findByIdAndUpdate(
        id,
        { course, fees },
        { new: true }
      );
      if (!isCourseExists) {
        return res.status(400).json({ message: "Course does not exists" });
      }
      await isCourseExists.save();
      res
        .status(200)
        .json({ message: "Successfully updated data", data: isCourseExists });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteFees(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const ifFeeExists = await FeesModel.findByIdAndDelete(id);
      if (!ifFeeExists) {
        return res.status(400).json({ message: "Fees does not exists" });
      }
      res.status(200).json({ message: "Fees deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async addStreams(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Course id is required" });
      }
      const isCourseExists = await FeesModel.findById(id);
      if (!isCourseExists) {
        return res.status(400).json({ message: "Course does not exists" });
      }
      const { stream_name, stream_fees } = req.body;
      if (!stream_name || !stream_fees) {
        return res.status(400).json({ message: "All fields are required" });
      }

      isCourseExists.streams.push({ stream_name, stream_fees });
      await isCourseExists.save();
      return res
        .status(200)
        .json({ message: `Stream Added in ${isCourseExists.course}` });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async editStream(req, res) {
    try {
      const { c_id, s_id, stream_name, stream_fees } = req.body;

      if (!c_id || !s_id) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const updatedCourse = await FeesModel.findOneAndUpdate(
        {
          _id: c_id,
          "streams._id": s_id,
        },
        {
          $set: {
            "streams.$.stream_name": stream_name,
            "streams.$.stream_fees": stream_fees,
          },
        },
        { new: true }
      );

      if (!updatedCourse) {
        return res.status(404).json({ message: "Course or Stream not found" });
      }

      return res.status(200).json({ message: "Stream updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
module.exports = { admin_Fess_Controller };
