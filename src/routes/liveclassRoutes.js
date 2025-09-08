const express = require("express");
const router = express.Router();
const liveClassController = require("../controllers/liveClassController");
const authMiddleware = require("../middleware/auth");

// GET live class schedule
router.get("/schedule", liveClassController.getSchedule);

// POST join live class (requires authentication)
router.post("/:id/join", authMiddleware, liveClassController.joinLiveClass);

// POST ask question (requires authentication)
router.post("/:id/questions", authMiddleware, liveClassController.askQuestion);

module.exports = router;
