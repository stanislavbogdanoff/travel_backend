const mongoose = require("mongoose");

const hotelServiceSchema = mongoose.Schema(
  {
    hotelServiceName: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    icon: String,
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("HotelService", hotelServiceSchema);
