const jwt = require("jsonwebtoken");
const AdminModel = require("../../models/admin.model");
const CounsellerModel = require("../../models/counseller.model");
const { accessToken, refreshToken } = require("../../tokens/token");
const ReceptionModel = require("../../models/reception.model");

const RefreshAccess = async (req, res) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refresh_token, process.env.R_TOKEN);

    const userId = decoded._id;

    const user =
      (await AdminModel.findById(userId)) ||
      (await CounsellerModel.findById(userId)) ||
      (await ReceptionModel.findById(userId));

    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    const newAccessToken = accessToken(user._id);
    const newRefreshToken = refreshToken(user._id);

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return res.status(200).json({
      message: "Token refreshed successfully",
      access_token: newAccessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = RefreshAccess;
