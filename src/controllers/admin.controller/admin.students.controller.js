const StudentModel = require("../../models/student.model");
const uploadTheImage = require("../../utils/cloudinary");
const VisitModel = require("../../models/visits.model");

const admin_studentController = {
  async getStudents(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const students = await StudentModel.find({
        payment_status: { $in: ["partial", "completed"] },
      }).populate("course_details.preffered_course", "course");
      res.status(200).json({ message: "Success", data: students });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async addNoteToStudent(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
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
      const admin = req.admin;
      if (!admin) {
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
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { s_id, n_id } = req.params;
      if (!s_id) {
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
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Counseller is not valid" });
      }
      const notes = await StudentModel.find({}, { notes: 1, _id: 0 });
      res.status(200).json({ message: "Success", data: notes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async postInitialRegFees(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
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
  async GetStudentVisitsById(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(401).json({ message: "Admin is not valid" });
      }
      const { user_id } = req.params;
      if (!user_id) {
        return res.status(400).json({ message: "User id is required" });
      }
      const isUserExists = await StudentModel.findOne({ _id: user_id });
      if (!isUserExists) {
        return res.status(400).json({ message: "User does not esists" });
      }
      const visits = await VisitModel.find({ existing_student_id: user_id });
      res.status(200).json({ message: "Success", data: visits });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async markFeesStatusCompleted(req, res) {
    try {
      const admin = req.admin;
      if (!admin) {
        return res.status(400).json({ message: "Admin is not valid" });
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
};

module.exports = { admin_studentController };
