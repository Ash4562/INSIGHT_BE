const express = require("express");
const {
  couns_Payment_Controller,
} = require("../../controllers/counseller.controller/counseller.payment");
const upload = require("../../middlewares/multer");
const couns_Payment_Router = express.Router();

couns_Payment_Router.post(
  "/pay/partial/:s_id",
  couns_Payment_Controller.makePartialPaymentPaid
)
couns_Payment_Router.post("/verify/partials", couns_Payment_Controller.verifyPartialPayment)


couns_Payment_Router.post("/pay/partial/offline/:s_id", couns_Payment_Controller.makePartialOfflinePayment)
couns_Payment_Router.post("/post/partial/recipt/:s_id/:id", 
  upload.single("tr_receipt"),
  couns_Payment_Controller.PostPartialReceiptByInstallmentId)


  



module.exports = couns_Payment_Router;
