const mongoose = require("mongoose");

const periodSchema = mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    sanatorium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sanatorium",
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
    },
    camp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp",
    },
    startDay: {
      type: Number,
    },
    startMonth: {
      type: Number,
    },
    endDay: {
      type: Number,
    },
    endMonth: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Period", periodSchema);
