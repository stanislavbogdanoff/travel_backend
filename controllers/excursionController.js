const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Hotel = require("../models/resorts/hotelModel");
const Excursion = require("../models/excursionModel");

//@desc   Get excursion by location
//@route  GET /api/excursions
//@access Public

const getExcursions = asyncHandler(async (req, res) => {
  const excursions = await Excursion.find({
    location: req.params.locationId,
  }).populate("location");
  res.status(200).send(excursions);
});

//@desc   Add new excursion
//@route  POST /api/excursions
//@access Public

const addExcursion = asyncHandler(async (req, res) => {
  const excursion = await Excursion.create({
    location: req.body.location,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  });
  res.status(200).send(excursion);
});

module.exports = {
  getExcursions,
  addExcursion,
};
