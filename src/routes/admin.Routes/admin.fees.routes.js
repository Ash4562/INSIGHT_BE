const express = require('express');
const { admin_Fess_Controller } = require('../../controllers/admin.controller/admin.fees.controller');
const admin_Fees_Router  = express.Router();

admin_Fees_Router.post('/add/fees', admin_Fess_Controller.addFees)
admin_Fees_Router.get('/get/fees', admin_Fess_Controller.getFees)
admin_Fees_Router.patch('/edit/fees/:id', admin_Fess_Controller.editFees)
admin_Fees_Router.delete('/delete/fees/:id', admin_Fess_Controller.deleteFees)
admin_Fees_Router.patch('/add/streams/:id', admin_Fess_Controller.addStreams)
admin_Fees_Router.patch('/edit/streams', admin_Fess_Controller.editStream)


module.exports = admin_Fees_Router;