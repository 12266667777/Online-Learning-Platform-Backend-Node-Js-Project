const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const authMiddleware = require("../middleware/auth");

// Get learning dashboard
router.get("/dashboard", authMiddleware, progressController.getDashboard);

// Get progress for a course
router.get("/course/:courseId", authMiddleware, progressController.getCourseProgress);

module.exports = router;
