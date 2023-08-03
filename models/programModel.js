const { Schema, model } = require("mongoose");

const programSchema = Schema({
  days: [
    {
      day: Number,
      points: [
        {
          time: String,
          pointName: String,
          description: String,
        },
      ],
    },
  ],
});

module.exports = new model("Program", programSchema);
