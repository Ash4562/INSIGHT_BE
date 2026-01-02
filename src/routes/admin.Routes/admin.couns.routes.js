const express = require('express');
const { adminCounsController } = require('../../controllers/admin.controller/admin.couns.controller');
const adminCounsRouter = express.Router();

adminCounsRouter.post("/add/counseller", adminCounsController.AddCounseller);
adminCounsRouter.get("/get/counsellers", adminCounsController.GetAllCounseller);
adminCounsRouter.delete("/delete/counseller/:couns_id", adminCounsController.deleteController);
adminCounsRouter.get("/get/visits/:id", adminCounsController.getVisitsbyCounsellerId);
adminCounsRouter.get("/get/all/visits", adminCounsController.getAllVisit);
adminCounsRouter.delete("/delete/visit/:v_id", adminCounsController.deleteVisitById);

module.exports = adminCounsRouter;