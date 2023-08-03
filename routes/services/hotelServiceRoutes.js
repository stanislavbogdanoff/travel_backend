const express = require("express");
const router = express.Router();
const {
  getHotelServices,
  addNewService,
} = require("../../controllers/services/hotelServiceController");
const { protect } = require("../../middleware/authMiddleware");

router.get("/", getHotelServices);
router.post("/", protect, addNewService);

module.exports = router;
