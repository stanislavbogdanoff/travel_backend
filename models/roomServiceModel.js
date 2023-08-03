const mongoose = require("mongoose");

const roomServiceSchema = mongoose.Schema(
  {
    roomServiceName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("RoomService", roomServiceSchema);
