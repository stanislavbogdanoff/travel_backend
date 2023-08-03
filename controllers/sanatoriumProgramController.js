const SanatoriumProgram = require("../models/sanatoriumProgramModel");

const getSanatoriumProgram = (req, res) => {
  SanatoriumProgram.find()
    .then((response) => res.status(200).send(response))
    .catch((err) => res.sendStatus(404));
};

const addSanatoriumProgram = (req, res) => {
  const { sanatoriumProgramName, description } = req.body;

  SanatoriumProgram.create({ sanatoriumProgramName, description })
    .then((response) => res.status(201).json(response))
    .catch(() => res.sendStatus(403));
};

const updateSanatoriumProgram = (req, res) => {
  const id = req.params.id;

  const { sanatoriumProgramName, description } = req.body;

  SanatoriumProgram.updateOne(
    { _id: id },
    {
      $set: {
        sanatoriumProgramName,
        description,
      },
    }
  )
    .then((response) => res.status(201).json(response))
    .catch(() => res.sendStatus(403));
};

const deleteSanatoriumProgram = (req, res) => {
  const id = req.params.id;
  SanatoriumProgram.deleteOne({ _id: id })
    .then(() => res.status(200).send("Successfully deleted"))
    .catch(() => res.sendStatus(403));
};

module.exports = {
  getSanatoriumProgram,
  addSanatoriumProgram,
  updateSanatoriumProgram,
  deleteSanatoriumProgram,
};
