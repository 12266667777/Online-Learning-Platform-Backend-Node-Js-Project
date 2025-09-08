const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

// Get all courses
router.get("/", courseController.getCourses);

// Get course by ID (auto-add lessons if empty)
router.get("/:id", courseController.getCourseById);

module.exports = router;
