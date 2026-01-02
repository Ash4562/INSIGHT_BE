const express = require("express");
const {
  rec_Auth,
} = require("../../controllers/reception.controller/recep.auth.controller");
const r_Auth_Router = express.Router();
const AuthMiddleware = require("../../middlewares/auth");

r_Auth_Router.post("/register/me", rec_Auth.Register);
r_Auth_Router.post("/send-otp", rec_Auth.SendOtp);
r_Auth_Router.post("/login/me", rec_Auth.Login);
module.exports = r_Auth_Router;
