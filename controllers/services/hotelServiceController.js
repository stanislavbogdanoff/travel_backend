const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const HotelService = require("../../models/services/hotelServiceModel");

//@desc   Get all hotel services
//@route  GET /api/hotelServices
//@access Public

const getHotelServices = asyncHandler(async (req, res) => {
  const hotelServices = await HotelService.find().populate("category");
  res.status(200).send(hotelServices);
});

//@desc   Add new service
//@route  GET /api/hotelServices
//@access Public

const addNewService = asyncHandler(async (req, res) => {
  const newService = await HotelService.create(req.body);
  res.status(200).send(newService);
});

module.exports = {
  getHotelServices,
  addNewService,
};
