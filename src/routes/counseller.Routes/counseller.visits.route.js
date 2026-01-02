
const express = require('express');
const { couns_VisitController } = require('../../controllers/counseller.controller/counseller.visits');
const couns_VisitRouter = express.Router();

couns_VisitRouter.get('/get/my/visitors', couns_VisitController.getMyVisitors);
couns_VisitRouter.patch('/reply/visit/:id', couns_VisitController.replyToVisit);

module.exports = couns_VisitRouter;