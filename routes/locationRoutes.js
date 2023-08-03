const express = require("express");
const router = express.Router();
const {
  getLocation,
  getAllLocations,
  getLocationByLetter,
} = require("../controllers/locationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:locationId", getLocation);
router.get("/", getAllLocations);

router.get("/query/find", getLocationByLetter);

module.exports = router;
