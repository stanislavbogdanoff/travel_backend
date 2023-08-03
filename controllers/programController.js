const Program = require("../models/programModel");

//@desc   Get all hotel services
//@route  GET /api/hotelServices
//@access Public

const getProgram = (req, res) => {
  Program.find()
    .then((response) => res.status(200).send(response))
    .catch((err) => res.sendStatus(404));
};

const addProgram = (req, res) => {
  // Дни должны быть от фронта
  const { days } = req.body;

  if (days) {
    Program.create({
      days,
    })
      .then((response) => res.status(201).json(response))
      .catch((err) => res.sendStatus(500));
  } else {
    res.sendStatus(405);
  }
};

const updateProgram = (req, res) => {
  const { days } = req.body;
  const id = req.params.id;

  if (days) {
    Program.updateOne(
      { _id: id },
      {
        $set: { days },
      }
    )
      .then((response) => res.status(202).json(response))
      .catch((err) => res.sendStatus(500));
  } else {
    res.sendStatus(405);
  }
};

const deleteProgram = (req, res) => {
  const id = req.params.id;

  Program.deleteOne({ _id: id })
    .then(() => res.status(200).send("Successfully deleted"))
    .catch(() => res.sendStatus(500));
};

module.exports = {
  getProgram,
  addProgram,
  updateProgram,
  deleteProgram,
};
