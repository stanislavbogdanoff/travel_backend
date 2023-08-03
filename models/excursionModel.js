const mongoose = require("mongoose");

const excursionSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Excursion", excursionSchema);
