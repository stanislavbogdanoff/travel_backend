const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Food = require("../../models/services/foodModel");

//@desc   Get all foods
//@route  GET /api/foods
//@access Public

const getAllFoods = asyncHandler(async (req, res) => {
  const foods = await Food.find();
  // const foods = [
  //   { label: "Без питания", value: "Без питания" },
  //   { label: "Персональный завтрак", value: "персональный завтрак" },
  //   { label: "Шведцкий стол", value: "шведцкий стол" },
  //   { label: "3-х разовое", value: "3х дневное" },
  //   { label: "3-х разовое (домашняя кухня)", value: "3х дневное" },
  //   { label: "Все включено", value: "все включено" },
  // ];
  res.status(200).json(foods);
});

module.exports = {
  getAllFoods,
};
