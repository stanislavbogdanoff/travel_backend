const mongoose = require("mongoose");

const locationSchema = mongoose.Schema(
  {
    label: String,
    value: String,
    locationName: {
      type: String,
    },
    locationCountry: {
      type: String,
    },
    locationDescription: {
      type: String,
      default:
        "Lorem ipsum dolor sit amet, id dicant splendide cum. Lorem ipsum dolor sit amet, id dicant splendide cum. Lorem ipsum dolor sit amet, id dicant splendide cum. Lorem ipsum dolor sit amet, id dicant splendide cum. Lorem ipsum dolor sit amet, id dicant splendide cum. Lorem ipsum dolor sit amet, id dicant splendide cum. Lorem ipsum dolor sit amet, id dicant splendide cum.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Location", locationSchema);
