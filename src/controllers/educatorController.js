const Educator = require("../models/educator");

exports.getEducators = async (req, res) => {
  try {
    const { subject, exam, rating } = req.query;
    const educators = await Educator.getEducators({ subject, exam, rating });

    res.json({
      success: true,
      educators: educators.map(e => ({
        id: e.id,
        name: e.name,
        subjects: e.subjects ? e.subjects.split(",") : [],
        experience: `${e.experience || 0} years`,
        rating: e.rating,
        totalStudents: e.totalStudents,
        courses: e.courses,
        image: e.image || null, // if you plan to add profile pics later
        isVerified: e.verification_status === "verified"
      }))
    });
  } catch (err) {
    console.error("Error fetching educators:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getEducatorProfile = async (req, res) => {
  try {
    const educatorId = req.params.id;
    const educator = await Educator.getEducatorById(educatorId);

    if (!educator) {
      return res.status(404).json({ success: false, message: "Educator not found" });
    }

    res.json({ success: true, educator });
  } catch (err) {
    console.error("Error fetching educator profile:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.followEducator = async (req, res) => {
  try {
    const educatorId = req.params.id;
    const userId = req.user.id; // from auth middleware

    const followed = await Educator.followEducator(userId, educatorId);

    if (!followed) {
      return res.status(400).json({ success: false, message: "Already following this educator" });
    }

    res.json({ success: true, message: "Educator followed successfully" });
  } catch (err) {
    console.error("Error following educator:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
