// Ensure courseId exists in request body for enroll
module.exports = (req, res, next) => {
    if (!req.body.courseId) {
        return res.status(400).json({ error: "Course ID is required" });
    }
    next();
};
