const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
    },
    uid: String,
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    peopleAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },
    margeSum: Number,
    daysAmount: {
      type: Number,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    status: {
      type: String,
      default: "В обработке",
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      required: true,
    },
    clientOtherPhone: {
      type: String,
    },
    extraInfo: {
      type: String,
    },
    excursions: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    mode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.virtual("hotelRoom", {
  ref: "Hotel",
  localField: "room",
  foreignField: "rooms._id",
  justOne: true,
});

orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

module.exports = new mongoose.model("Order", orderSchema);
