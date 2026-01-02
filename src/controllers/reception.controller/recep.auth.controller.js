const { toolresults } = require("googleapis/build/src/apis/toolresults");
const otpModel = require("../../models/otp.model");
const ReceptionModel = require("../../models/reception.model");
const { accessToken, refreshToken } = require("../../tokens/token");

const rec_Auth = {
  async Register(req, res) {
    try {
      const { reception_name, reception_email, reception_contact } = req.body;
      if (!reception_name || !reception_email || !reception_contact) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isEmailExists = await ReceptionModel.findOne({ reception_email });
      if (isEmailExists) {
        return res.status(400).json({ message: "Reception already exists" });
      }

      const reception = new ReceptionModel({
        reception_name,
        reception_email,
        reception_contact,
      });
      await reception.save();
      res.status(201).json({ message: "Success", data: reception });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async SendOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: error.message });
      }
      const isEmailExist = await ReceptionModel.findOne({
        reception_email: email,
      });
      if (!isEmailExist) {
        return res.status(400).json({ message: "Mail does not exists" });
      }
      const otp = 123456;
      await otpModel.findOneAndUpdate(
        { email },
        { otp, createdAt: Date.now() },
        { upsert: true, new: true }
      );
      res.status(200).json({ message: "Otp sent successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async Login(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const isEmailExists = await ReceptionModel.findOne({
        reception_email: email,
      });
      if (!isEmailExists) {
        return res.status(400).json({ message: "Email does not exists" });
      }
      const isOtpCorrect = await otpModel.findOne({ email, otp });
      if (!isOtpCorrect) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
      const access_token = accessToken(isEmailExists._id);
      const refresh_token = refreshToken(isEmailExists._id);

      console.log("Access", access_token);
      console.log("Refresh", refresh_token);

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        sameSite: "none",
        // sameSite: "Lax",
        secure: true,
        // secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Login Successfull",
        data: isEmailExists,
        access_token: access_token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { rec_Auth };
