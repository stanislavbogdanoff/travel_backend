const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const Category = require("../../models/services/categoryModel");

//@desc   Get all categories
//@route  GET /api/categories
//@access Public

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).send(categories);
});

module.exports = {
  getCategories,
};
