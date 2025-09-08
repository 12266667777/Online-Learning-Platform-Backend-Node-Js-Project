const express = require("express");
const router = express.Router();
const testController = require("../controllers/testController");
const authMiddleware = require("../middleware/auth");

// GET available tests
router.get("/", testController.getTests);

// POST start a test (requires authentication)
router.post("/:id/start", authMiddleware, testController.startTest);

// POST submit test (requires authentication)
router.post("/:sessionId/submit", authMiddleware, testController.submitTest);

module.exports = router;
