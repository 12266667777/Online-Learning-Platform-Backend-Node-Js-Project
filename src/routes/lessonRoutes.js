// src/routes/lessonRoutes.js
const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const auth = require("../middleware/auth");

// Get lesson details (requires enrollment)
router.get("/:id", auth, lessonController.getLessonDetails);

// Update lesson progress (requires authentication)
router.post("/:id/progress", auth, lessonController.updateLessonProgress);

// Save lesson notes (requires authentication)
router.post("/:id/notes", auth, lessonController.saveLessonNotes);

module.exports = router;
