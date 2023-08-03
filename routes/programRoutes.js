const { Router } = require("express");
const router = Router();

const {
  getProgram,
  addProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programController");
const {
  getSanatoriumProgram,
  addSanatoriumProgram,
  deleteSanatoriumProgram,
  updateSanatoriumProgram,
} = require("../controllers/sanatoriumProgramController");
const { protect } = require("../middleware/authMiddleware");

// Programs
router.get("/", getProgram);
router.post("/", protect, addProgram);
router.patch("/:id", updateProgram);
router.delete("/:id", deleteProgram);

// Sanatorium
router.get("/sanatorium", getSanatoriumProgram);
router.post("/sanatorium", protect, addSanatoriumProgram);
router.patch("/sanatorium/:id", updateSanatoriumProgram);
router.delete("/sanatorium/:id", deleteSanatoriumProgram);

module.exports = router;
