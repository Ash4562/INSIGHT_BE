const multer = require("multer");

const sizeLimiter = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size must be less than 300 KB",
      });
    }
    return res.status(400).json({ message: err.message });
  }

  next(err);
};

module.exports = sizeLimiter;
