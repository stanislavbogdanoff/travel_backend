const express = require("express");
const router = express.Router();
const { getAllFoods } = require("../../controllers/services/foodController");
const { protect } = require("../../middleware/authMiddleware");

router.get("/", getAllFoods);

module.exports = router;
