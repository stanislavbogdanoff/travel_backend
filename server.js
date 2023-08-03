const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const port = process.env.PORT || 5000;
const emailRoutes = require("./routes/emails/emailRoutes");

// DB connection
connectDB();

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api", emailRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/excursions", require("./routes/excursionRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api/foods", require("./routes/services/foodRoutes"));
app.use("/api/categories", require("./routes/services/categoryRoutes"));
app.use("/api/hotelServices", require("./routes/services/hotelServiceRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/programs", require("./routes/programRoutes"));
app.use("/api/hotels", require("./routes/resorts/hotelRoutes"));
app.use("/api/sanatoriums", require("./routes/resorts/sanatoriumRoutes"));
app.use("/api/camps", require("./routes/resorts/campRoutes"));
app.use("/api/tour", require("./routes/resorts/tourRoutes"));
app.use("/api/periods", require("./routes/periodRoutes"));
app.use("/images", express.static(path.join(__dirname, "../public/uploads")));

// Error middleware
app.use(errorHandler);

// Start server
app.listen(port, () => console.log(`Port ${port} is up and running baby`));
