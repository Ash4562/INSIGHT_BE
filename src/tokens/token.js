const jwt = require("jsonwebtoken");

const accessToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.A_TOKEN, { expiresIn: "15m" });
};
const refreshToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.R_TOKEN, { expiresIn: "7d" });
};

module.exports = { accessToken, refreshToken }
