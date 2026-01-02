const express = require("express");
const {
  counsAuth,
} = require("../../controllers/counseller.controller/counseller.auth");
const authMiddleware = require("../../middlewares/auth");
const counsAuthRouter = express.Router();

counsAuthRouter.post("/send-otp", counsAuth.SendOtp);
counsAuthRouter.post("/login/me", counsAuth.Login);
counsAuthRouter.post(
  "/special/logout",
  authMiddleware,
  counsAuth.specialLogout
);

module.exports = counsAuthRouter;
