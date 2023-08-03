const express = require("express");
const router = express.Router();
const {
  getRooms,
  addRoom,
  getSingleRoom,
  updateRoom,
  insertPrices,
  deleteRoom,
} = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");
const Room = require("../models/roomModel");
const { upload } = require("./uploadRoutes");

router.get("/", getRooms);
router.post("/", protect, addRoom);
router.get("/:roomId", protect, getSingleRoom);
router.patch("/:roomId", protect, updateRoom);
router.delete("/:roomId", protect, deleteRoom);
router.patch("/:roomId/prices", protect, insertPrices);

router.patch("/:roomId/upload", upload.array("images", 5), (req, res) => {
  const filePath = req.files.map(
    (file) => `http://localhost:5000/images/${file.filename}`
  );

  Room.updateOne(
    { _id: req.params.roomId },
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
