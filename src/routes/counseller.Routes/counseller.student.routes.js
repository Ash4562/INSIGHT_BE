const express = require("express");
const {
  counStudentController,
} = require("../../controllers/counseller.controller/counseller.student");
const upload = require("../../middlewares/multer");
const sizeLimiter = require("../../middlewares/uploadLimiter");
const counStudentRouter = express.Router();

counStudentRouter.post(
  "/add/student",
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "admit_card", maxCount: 1 },
    { name: "score_card", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "ssc_marksheet", maxCount: 1 },
    { name: "ssc_certificate", maxCount: 1 },
    { name: "hsc_marksheet", maxCount: 1 },
    { name: "leaving_certificate", maxCount: 1 },
    { name: "nationality", maxCount: 1 },
    { name: "medical_certificate", maxCount: 1 },
    { name: "gap_certificate", maxCount: 1 },
    { name: "income_certificate", maxCount: 1 },
    { name: "state_ews", maxCount: 1 },
    { name: "central_ews", maxCount: 1 },
    { name: "state_caste", maxCount: 1 },
    { name: "central_caste", maxCount: 1 },
    { name: "caste_validity", maxCount: 1 },
    { name: "non_creamy_layer", maxCount: 1 },
    { name: "any_other", maxCount: 1 },
  ]),sizeLimiter,
  counStudentController.AddStudent
);
counStudentRouter.post('/verify/initials', counStudentController.verifyPayment)
counStudentRouter.patch(
  "/edit/student/:id",
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "admit_card", maxCount: 1 },
    { name: "score_card", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "ssc_marksheet", maxCount: 1 },
    { name: "ssc_certificate", maxCount: 1 },
    { name: "hsc_marksheet", maxCount: 1 },
    { name: "leaving_certificate", maxCount: 1 },
    { name: "nationality", maxCount: 1 },
    { name: "medical_certificate", maxCount: 1 },
    { name: "gap_certificate", maxCount: 1 },
    { name: "income_certificate", maxCount: 1 },
    { name: "state_ews", maxCount: 1 },
    { name: "central_ews", maxCount: 1 },
    { name: "state_caste", maxCount: 1 },
    { name: "central_caste", maxCount: 1 },
    { name: "caste_validity", maxCount: 1 },
    { name: "non_creamy_layer", maxCount: 1 },
    { name: "any_other", maxCount: 1 },
  ]),
  counStudentController.UpdateStudent
);

counStudentRouter.delete(
  "/delete/student/:id",
  counStudentController.DeleteStudent
);
counStudentRouter.get("/get", counStudentController.getStudents);
counStudentRouter.post("/add/note/:id", counStudentController.addNoteToStudent);
counStudentRouter.patch(
  "/edit/note/:s_id/:n_id",
  counStudentController.editNote
);
counStudentRouter.delete(
  "/delete/note/:s_id/:n_id",
  counStudentController.deleteNote
);
counStudentRouter.patch(
  "/mark/:status/:s_id/:d_id",
  counStudentController.approveOrRejectStudentDocs
);

counStudentRouter.patch(
  "/mark/step/completed/:s_id/:step_id",
  counStudentController.markAdmissionStepCompleted
);

counStudentRouter.post(
  "/upload-registration/:s_id/:step_id",
  upload.single("image"),
  counStudentController.uploadRegistrationImage
);

counStudentRouter.get(
  "/get/my/students",
  counStudentController.getMyAddedStudents
);
counStudentRouter.get("/get/all/notes", counStudentController.getNotes);
counStudentRouter.post(
  "/student/:s_id/add-doc",
  upload.single("doc"),
  counStudentController.uploadDoc
);

counStudentRouter.patch(
  "/mark/fee/completed/:s_id/:f_id",
  counStudentController.markFeesStatusCompleted
);

counStudentRouter.post(
  "/post/initial/reg/fees/receipt/:s_id",
  upload.single("initial_reg_receipt"),
  counStudentController.postInitialRegFees
);


counStudentRouter.post(
  "/add/student/offline",
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "admit_card", maxCount: 1 },
    { name: "score_card", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "ssc_marksheet", maxCount: 1 },
    { name: "ssc_certificate", maxCount: 1 },
    { name: "hsc_marksheet", maxCount: 1 },
    { name: "leaving_certificate", maxCount: 1 },
    { name: "nationality", maxCount: 1 },
    { name: "medical_certificate", maxCount: 1 },
    { name: "gap_certificate", maxCount: 1 },
    { name: "income_certificate", maxCount: 1 },
    { name: "state_ews", maxCount: 1 },
    { name: "central_ews", maxCount: 1 },
    { name: "state_caste", maxCount: 1 },
    { name: "central_caste", maxCount: 1 },
    { name: "caste_validity", maxCount: 1 },
    { name: "non_creamy_layer", maxCount: 1 },
    { name: "any_other", maxCount: 1 },
  ]),sizeLimiter,
  counStudentController.offlineAddingStudent
);

counStudentRouter.get('/get/visits/:id', counStudentController.getVisitsByStudentId);
counStudentRouter.patch('/add/external/addon/:s_id', counStudentController.AddExternalAddOnStream)

module.exports = counStudentRouter;
