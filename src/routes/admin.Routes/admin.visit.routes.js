

const express = require('express');
const { admin_Visit_Controller } = require('../../controllers/admin.controller/admin.visit.controller');
const admin_Visit_Router = express.Router();

admin_Visit_Router.get('/requests', admin_Visit_Controller.getMyVisitRequest)
admin_Visit_Router.patch('/reply/visit/:id', admin_Visit_Controller.replyToVisit);



module.exports = admin_Visit_Router;