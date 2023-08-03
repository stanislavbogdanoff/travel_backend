const express = require("express");
const router = express.Router();
const {
  getPeriods,
  addPeriods,
  getPeriodsByHotel,
  deletePeriod,
  addSanatoriumPeriods,
  deleteSanatoriumPeriod,
  addTourPeriods,
  deleteTourPeriod,
  addCampPeriods,
  deleteCampPeriod,
} = require("../controllers/periodController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getPeriods);
router.post("/", protect, addPeriods);
router.post("/sanatorium", protect, addSanatoriumPeriods);
router.post("/tour", protect, addTourPeriods);
router.post("/camp", protect, addCampPeriods);
router.get("/:hotelId", getPeriodsByHotel);
router.delete("/:periodId", protect, deletePeriod);
router.delete("/:periodId/sanatorium", protect, deleteSanatoriumPeriod);
router.delete("/:periodId/tour", protect, deleteTourPeriod);
router.delete("/:periodId/camp", protect, deleteCampPeriod);

module.exports = router;
