const express = require("express");
const multer = require("multer"); // Import multer for file uploads
const { protect } = require("../middleware/authMiddleware");
const Car = require("../models/Car");
const User = require("../models/User"); // Import the User model
const path = require("path"); // To handle file path
const fs = require("fs"); // To handle file system tasks

const router = express.Router();

// Set up multer storage and file naming configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to 'uploads/' folder
  },
  filename: (req, file, cb) => {
    const newName = file.originalname.replace(/\s+/g, "_"); // Replace spaces with underscores
    cb(null, Date.now() + "_" + newName); // Prefix file name with timestamp to ensure uniqueness
  },
});

const upload = multer({ storage: storage }); // Use multer for file uploads

// Upload images route (could be used for image upload)
router.post("/upload-images", upload.array("images", 5), (req, res) => {
  try {
    // If there are no files uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Get the filenames of uploaded images
    const uploadedImages = req.files.map(file => file.filename); // Collect all the image file names

    res.status(200).json({ fileNames: uploadedImages }); // Return the image file names
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: "Server error while uploading images" });
  }
});

// Add a new car
router.post("/", protect, upload.array("images", 5), async (req, res) => {
  const { name, title, description, tags } = req.body;
  
  console.log("Request Body:", req.body);
  console.log("Uploaded Files:", req.files); // Log the uploaded files

  try {
    // Process the uploaded image filenames (replace spaces in filenames)
    const imageNames = req.files.map(file => file.filename);

    // Create a new car with the uploaded image file names
    const car = await Car.create({
      user: req.user.id, // Get user ID from token
      name,
      images: imageNames, // Store the image filenames
      title,
      description,
      tags,
    });

    // Add the car ID to the user's `cars` array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { cars: car._id } },
      { new: true }
    );

    res.status(201).json(car); // Respond with the created car details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while adding car" });
  }
});

// Get all cars for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cars");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Edit car details
router.put("/:id", protect, async (req, res) => {
  const { id } = req.params;
  const { name, images, title, description, tags } = req.body;

  try {
    // Find the car and ensure it belongs to the user
    const car = await Car.findOne({ _id: id, user: req.user.id });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Update car details
    car.name = name || car.name;
    car.images = images || car.images;
    car.title = title || car.title;
    car.description = description || car.description;
    car.tags = tags || car.tags;

    const updatedCar = await car.save();
    res.status(200).json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a car
router.delete("/:id", protect, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the car and ensure it belongs to the user
    const car = await Car.findOne({ _id: id, user: req.user.id });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await car.remove();
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get specific car details
router.get("/spec/:id", protect, async (req, res) => {
  const { id } = req.params;

  try {
    const car = await Car.findOne({ _id: id, user: req.user.id });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
