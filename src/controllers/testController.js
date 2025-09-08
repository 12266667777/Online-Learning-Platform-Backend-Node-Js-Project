const Test = require("../models/test");

exports.getTests = async (req, res) => {
  try {
    const { courseId, type, subject } = req.query;
    const tests = await Test.getTests({ courseId, type, subject });
    res.json({ success: true, tests });
  } catch (err) {
    console.error("Error fetching tests:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.startTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id; // from auth middleware
    const testSession = await Test.startTest(testId, userId);

    if (!testSession) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    res.json({ success: true, testSession });
  } catch (err) {
    console.error("Error starting test:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { answers, timeSpent } = req.body;

    const result = await Test.submitTest(sessionId, userId, answers, timeSpent);

    if (!result) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error("Error submitting test:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
