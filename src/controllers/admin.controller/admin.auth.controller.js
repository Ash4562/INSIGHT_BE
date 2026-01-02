const AdminModel = require("../../models/admin.model");
const bcrypt = require("bcrypt");
const { accessToken, refreshToken } = require("../../tokens/token");
const CounsellerModel = require("../../models/counseller.model");

const adminAuth = {
  async Register(req, res) {
    try {
      const { name, email, password, contact } = req.body;
      if (!name || !email || !password || !contact) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isAdminExists = await AdminModel.findOne({ email });
      if (isAdminExists) {
        return res.status(400).json({ message: "Admin already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new AdminModel({
        name,
        email,
        contact,
        password: hashedPassword,
      });
      await admin.save();
      res.status(201).json({ message: "Admin Registered", data: admin });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async Login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isAdminExists = await AdminModel.findOne({ email });
      if (!isAdminExists) {
        return res.status(400).json({ message: "Admin is not valid" });
      }
      const isPasswordValid = await bcrypt.compare(
        password,
        isAdminExists.password
      );
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Password is not valid" });
      }

      isAdminExists.password = undefined;

      const access_token = accessToken(isAdminExists._id);
      const refresh_token = refreshToken(isAdminExists._id);

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        message: "login Successfull",
        admin: isAdminExists,
        access: access_token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { adminAuth };
