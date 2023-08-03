const mongoose = require("mongoose");

const hotelSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    searchable: Boolean,
    img: [String],
    uid: String,
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    locationFeature: {
      type: String,
    },
    resortId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    mapLink: {
      type: String,
    },
    phone: {
      type: String,
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
    },
    foodIncluded: Boolean,
    extrasFoodIncludd: Boolean,
    periods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Period",
      },
    ],
    kidFoodPrice: {
      type: Number,
    },
    adultFoodPrice: {
      type: Number,
    },
    babyFoodInfo: {
      type: String,
    },
    marge: {
      type: Number,
      default: 10,
    },
    kids: {
      babyMaxAge: {
        type: Number,
      },
      kidMaxAge: {
        type: Number,
      },
      kidDiscount: {
        discountType: {
          type: String,
        },
        discountValue: {
          type: Number,
        },
      },
    },
    comforts: [String],
    payment: {
      paymentType: {
        type: String,
      },
      prepayment: {
        type: Number,
      },
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingVotes: {
      type: Number,
    },
    hotelStars: {
      type: Number,
    },
    description: {
      type: String,
    },
    enterTime: {
      type: String,
    },
    leaveTime: {
      type: String,
    },
    hotelServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HotelService",
      },
    ],
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hotel = new mongoose.model("Hotel", hotelSchema);

module.exports = { Hotel };
