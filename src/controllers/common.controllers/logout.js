
const LogoutAuth = {
  async Logout(req, res) {
    try {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { LogoutAuth };
