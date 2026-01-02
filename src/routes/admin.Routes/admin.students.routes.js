const upload = require("../../middlewares/multer");

const express = require("express");
const {
  admin_studentController,
} = require("../../controllers/admin.controller/admin.students.controller");
const admin_StudentRouter = express.Router();

admin_StudentRouter.get("/get/students", admin_studentController.getStudents);
admin_StudentRouter.post(
  "/add/note/:id",
  admin_studentController.addNoteToStudent
);
admin_StudentRouter.patch(
  "/edit/note/:s_id/:n_id",
  admin_studentController.editNote
);
admin_StudentRouter.get("/get/all/notes", admin_studentController.getNotes);
admin_StudentRouter.delete(
  "/delete/note/:s_id/:n_id",
  admin_studentController.deleteNote
);
admin_StudentRouter.post(
  "/post/initial/reg/fees/receipt/:s_id",
  upload.single("initial_reg_receipt"),
  admin_studentController.postInitialRegFees
);
admin_StudentRouter.get(
  "/get/visits/:user_id",
  admin_studentController.GetStudentVisitsById
);

admin_StudentRouter.patch(
  "/mark/fee/completed/:s_id/:f_id",
  admin_studentController.markFeesStatusCompleted
);

module.exports = admin_StudentRouter;
