const mongoose = require("mongoose");

const resortSchema = mongoose.Schema(
  {
    resortName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Resort", resortSchema);
