const { Router } = require("express");
const router = Router();
const {
  addTour,
  deleteTour,
  getSingleTour,
  getTour,
  updateTour,
  getSearchedTours,
  insertTourPrices,
  tourByTagRecommendation,
  getPrice,
} = require("../../controllers/resorts/tourController");
const Tour = require("../../models/resorts/tourModel");
const { protect } = require("../../middleware/authMiddleware");
const { upload } = require("../uploadRoutes");

router.get("/", getTour);
router.post("/", protect, addTour);
router.get("/price", getPrice);
router.get("/searched", getSearchedTours);

router.get("/:id", getSingleTour);
router.delete("/:id", protect, deleteTour);
router.patch("/:id", protect, updateTour);

// router.patch("/:tourId/tourPrices", upload.single("file"), insertTourPrices);

router.post("/recommendation", tourByTagRecommendation);

router.patch("/:tourId/upload", upload.array("images", 5), (req, res) => {
  const filePath = req.files.map(
    (file) => `http://localhost:5000/images/${file.filename}`
  );

  Tour.updateOne(
    { _id: req.params.tourId },
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
