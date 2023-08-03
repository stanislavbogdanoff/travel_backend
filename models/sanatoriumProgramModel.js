const { Schema, model } = require("mongoose");

const sanatoriumServiceSchema = Schema(
  {
    sanatoriumProgramName: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("SanatoriumProgram", sanatoriumServiceSchema);
