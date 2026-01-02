

const express = require('express');
const { couns_Profile } = require('../../controllers/counseller.controller/counseller.profile');
const couns_ProfileRouter = express.Router();

couns_ProfileRouter.patch('/update/profile', couns_Profile.EditProfile);

module.exports = couns_ProfileRouter;