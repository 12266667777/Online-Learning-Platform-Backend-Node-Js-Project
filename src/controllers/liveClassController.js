const LiveClass = require("../models/liveclass");

exports.getSchedule = async (req, res) => {
  try {
    const { courseId, date, upcoming } = req.query;
    const classes = await LiveClass.getSchedule({ courseId, date, upcoming });

    res.json({ success: true, liveClasses: classes });
  } catch (err) {
    console.error("Error fetching schedule:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.joinLiveClass = async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const userId = req.user.id; // from auth middleware

    const liveClass = await LiveClass.joinLiveClass(liveClassId, userId);
    res.json({ success: true, liveClass });
  } catch (err) {
    console.error("Error joining live class:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.askQuestion = async (req, res) => {
  try {
    const liveClassId = req.params.id;
    const userId = req.user.id; // from auth middleware
    const { question, timestamp } = req.body;

    const questionId = await LiveClass.askQuestion(
      liveClassId,
      userId,
      question,
      timestamp
    );

    res.json({ success: true, message: "Question submitted", questionId });
  } catch (err) {
    console.error("Error asking question:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
