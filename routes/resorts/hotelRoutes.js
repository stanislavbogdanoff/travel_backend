const express = require("express");
const router = express.Router();
const {
  addHotel,
  getHotels,
  getSearchedHotels,
  getSingleHotel,
  getAdminHotels,
  updateHotel,
  insertPrices,
  getRoomPrices,
  insertTourPrices,
  getRoomsByLimit,
  updateHotelPeriods,
  deletePeriod,
  getByTagRecommendation,
  getPrice,
  getPriceRanges,
  // setSearchable,
} = require("../../controllers/resorts/hotelController");
const { protect } = require("../../middleware/authMiddleware");

const { Hotel } = require("../../models/resorts/hotelModel");

const { upload } = require("./../uploadRoutes");

router.post("/", protect, addHotel);
router.get("/", getHotels);
router.get("/price", getPrice);
router.get("/searched", getSearchedHotels);
router.get("/admin", getAdminHotels);
router.get("/price_range", getPriceRanges);

router.patch("/:hotelId", protect, updateHotel);
// router.patch("/:hotelId/periods", protect, updateHotelPeriods);
// router.patch("/:hotelId/delete-period", protect, deletePeriod);
router.get("/:id", getSingleHotel);

// router.post("/:hotelId", setSearchable);

router.get("/:hotelId/room", getRoomsByLimit);
router.post("/hotelRecommendation/tags", getByTagRecommendation);

router.patch("/:hotelId/upload", upload.array("images", 5), (req, res) => {
  const filePath = req.files.map(
    (file) => `http://localhost:5000/images/${file.filename}`
  );
  Hotel.updateOne(
    { _id: req.params.hotelId },
    {
      $set: {
        img: filePath,
      },
    }
  )
    .then((response) => res.status(201).json(filePath))
    .catch(() => res.sendStatus(500));
});

module.exports = router;
