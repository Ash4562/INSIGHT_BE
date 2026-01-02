const express = require('express');
const { recep_VisitsController } = require('../../controllers/reception.controller/recep.visits.controller');
const recep_VisitsRouter = express.Router();

recep_VisitsRouter.post('/schedule/visit', recep_VisitsController.ScheduleVisit)
recep_VisitsRouter.get('/get/visits', recep_VisitsController.GetAllVisits)
recep_VisitsRouter.get('/get/admins', recep_VisitsController.getAllAdmin)

module.exports = recep_VisitsRouter;