const jwt = require("jsonwebtoken");
const AdminModel = require("../models/admin.model");
const CounsellerModel = require("../models/counseller.model");
const ReceptionModel = require("../models/reception.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.A_TOKEN);
    const { _id } = decoded;

    const admin = await AdminModel.findById(_id);
    if (admin) {
      req.admin = admin;
      return next();
    }

    const counseller = await CounsellerModel.findById(_id);
    if (counseller) {
      req.counseller = counseller;
      return next();
    }

    const reception = await ReceptionModel.findById(_id);
    if (reception) {
      req.reception = reception;
      return next();
    }
    return res.status(401).json({ message: "User not found" });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

module.exports = authMiddleware;
