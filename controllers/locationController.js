const asyncHandler = require("express-async-handler");
const Location = require("../models/locationModel");

//@desc   Get location by id
//@route  GET /api/locations/id
//@access Public

const getLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.locationId);
  res.status(200).json(location);
});

//@desc   Get all locations
//@route  GET /api/locations
//@access Public

const getAllLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find();
  res.status(200).json(locations);
});

const getLocationByLetter = (req, res) => {
  const { query } = req.query;
  let q = {};
  if (query) {
    q.locationName = { $regex: query, $options: "i" };
  }

  // console.log(q);

  Location.find(q)
    .then((response) => res.status(200).json(response))
    .catch(() => res.sendStatus(500));
};

module.exports = {
  getLocation,
  getAllLocations,
  getLocationByLetter,
};
