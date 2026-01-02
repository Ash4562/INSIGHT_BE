const express = require("express");
const {
  adminAuth,
} = require("../../controllers/admin.controller/admin.auth.controller");
const adminAuthRouter = express.Router();

adminAuthRouter.post("/register/me", adminAuth.Register);
adminAuthRouter.post("/login/me", adminAuth.Login);
// adminAuthRouter.post("/logout", adminAuth.Logout);




module.exports = adminAuthRouter;
