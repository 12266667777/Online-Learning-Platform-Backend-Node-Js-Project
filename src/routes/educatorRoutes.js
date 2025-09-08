const express = require("express");
const router = express.Router();
const educatorController = require("../controllers/educatorController");
const authMiddleware = require("../middleware/auth");

// Browse educators
router.get("/", educatorController.getEducators);

// Get educator profile
router.get("/:id", educatorController.getEducatorProfile);

// Follow educator (requires authentication)
router.post("/:id/follow", authMiddleware, educatorController.followEducator);

module.exports = router;
