const mongoose = require("mongoose");

const foodSchema = mongoose.Schema(
  {
    label: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Food", foodSchema);
