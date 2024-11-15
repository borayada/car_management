const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");  // Import CORS
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const carRoutes = require("./routes/car");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
