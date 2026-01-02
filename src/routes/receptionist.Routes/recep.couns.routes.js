

const express = require('express');
const { recep_counsController } = require('../../controllers/reception.controller/recep.couns.controller');
const recep_CounsRouter = express.Router();

recep_CounsRouter.get('/get/counsellers',recep_counsController.getAllCounsellers)

module.exports = recep_CounsRouter