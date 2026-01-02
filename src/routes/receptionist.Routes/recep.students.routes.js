
const express = require('express');
const { recept_StudentController } = require('../../controllers/reception.controller/recept.students.controller');
const recept_StudentRouter = express.Router();

recept_StudentRouter.get('/get/all/students', recept_StudentController.GetAllStudents)

module.exports = recept_StudentRouter;