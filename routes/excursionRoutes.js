const express = require("express");
const router = express.Router();
const {
  getExcursions,
  addExcursion,
} = require("../controllers/excursionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:locationId", getExcursions);
router.post("/", addExcursion);

module.exports = router;
