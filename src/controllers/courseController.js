const courseModel = require("../models/course");

// GET all courses
async function getCourses(req, res) {
  try {
    const courses = await courseModel.getCourses(req.query);
    res.json({ success: true, courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET course by ID
async function getCourseById(req, res) {
  try {
    let course = await courseModel.getCourseById(req.params.id);

    // If no lessons, auto-add default lessons
    if (course && Object.keys(course.syllabus).length === 0) {
      course = await courseModel.addDefaultLessons(req.params.id);
    }

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    res.json({ success: true, course });
  } catch (err) {
    console.error("Error in getCourseById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { getCourses, getCourseById };
