const express = require('express');
const { couns_FeesController } = require('../../controllers/counseller.controller/counseller.fees');
const couns_CoursesRouter = express.Router();

couns_CoursesRouter.get('/get/courses', couns_FeesController.getCourses)

module.exports = couns_CoursesRouter;