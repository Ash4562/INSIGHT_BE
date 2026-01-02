const CounsellerModel = require("../../models/counseller.model");
const otpModel = require("../../models/otp.model");
const { accessToken, refreshToken } = require("../../tokens/token");

const counsAuth = {
  async SendOtp(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const isEmailExist = await CounsellerModel.findOne({
        couns_email: email,
      });
      if (!isEmailExist) {
        return res.status(400).json({ message: "Email does not exist" });
      }

      // const otp = Math.floor(100000 + Math.random() * 900000);
      const otp = 123456;

      await otpModel.findOneAndUpdate(
        { email },
        { otp, createdAt: Date.now() },
        { upsert: true, new: true }
      );

      return res.status(201).json({ message: "OTP sent successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  async Login(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "All fields must be provided" });
    }
    const isUserValid = await CounsellerModel.findOne({ couns_email: email });
    if (!isUserValid) {
      return res.status(401).json({ message: "Counseller is not valid" });
    }
    const isOtpValid = await otpModel.findOne({ email, otp });
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid credentials " });
    }
    await otpModel.findByIdAndDelete(isOtpValid._id);

    const access_token = accessToken(isUserValid._id);
    const refresh_token = refreshToken(isUserValid._id);

    isUserValid.isLogin = true;
    await isUserValid.save();

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({
        message: "Login Successfull",
        access_token: access_token,
        data: isUserValid,
      });

    try {
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async specialLogout(req, res) {
    try {
      const counseller = req.counseller;
      if (!counseller) {
        return res.status(400).json({ message: "Counseller is not valid" });
      }
      await CounsellerModel.findByIdAndUpdate(counseller._id, {
        isLogin: false,
      });
      res
        .status(200)
        .json({ message: "Successfully Logged out and you are now inactive" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { counsAuth };
