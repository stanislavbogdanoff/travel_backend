const mongoose = require("mongoose");

const typeSchema = mongoose.Schema(
  {
    typeName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Type", typeSchema);
