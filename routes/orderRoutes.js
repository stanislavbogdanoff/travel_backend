const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrders,
  updateOrder,
  getSingleOrder,
  searchOrders,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", addOrder);
router.get("/", getOrders);
router.patch("/:id", updateOrder);
router.get("/:orderId", getSingleOrder);

router.get("/order/search", searchOrders);

module.exports = router;
