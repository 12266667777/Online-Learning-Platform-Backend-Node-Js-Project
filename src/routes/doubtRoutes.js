// src/routes/doubtRoutes.js
const express = require("express");
const router = express.Router();
const doubtModel = require("../models/dought");
const authMiddleware = require("../middleware/auth");

// ✅ POST /api/doubts
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // For now educatorId is assigned later (platform logic)
    const result = await doubtModel.createDoubt(req.user.user_id, 1, question);

    res.json({ success: true, doubtId: result.doubt_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /api/doubts/my
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const doubts = await doubtModel.getDoubtsByUser(req.user.user_id);
    res.json({ success: true, doubts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST /api/doubts/:id/answer (educator only)
router.post("/:id/answer", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "educator") {
      return res.status(403).json({ error: "Only educators can answer doubts" });
    }

    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ error: "Answer text is required" });
    }

    await doubtModel.answerDoubt(req.params.id, answer);
    res.json({ success: true, message: "Answer submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
