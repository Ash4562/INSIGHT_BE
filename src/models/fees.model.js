const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  stream_name: String,
  stream_fees: Number,
});

const feesSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      unqiue: true,
    },
    streams: [streamSchema],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Fees", feesSchema);
