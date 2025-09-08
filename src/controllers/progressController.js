const Progress = require("../models/progress");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboard = await Progress.getDashboard(userId);
    res.json({ success: true, dashboard });
  } catch (err) {
    console.error("Error fetching dashboard:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const progress = await Progress.getCourseProgress(userId, courseId);

    if (!progress) {
      return res.status(404).json({ success: false, message: "Course not found or not enrolled" });
    }

    res.json({ success: true, progress });
  } catch (err) {
    console.error("Error fetching course progress:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
