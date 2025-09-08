const db = require("../config/database");

// Live Class Model
const LiveClass = {
  // Fetch schedule with optional filters
  async getSchedule({ courseId, date, upcoming }) {
    let query = `
      SELECT lc.id, lc.title, lc.educator, lc.scheduled_at as scheduledAt, lc.duration,
             lc.course_id as courseId, lc.max_students as maxStudents,
             COUNT(lce.user_id) as enrolled,
             lc.status, lc.join_url as joinUrl
      FROM live_classes lc
      LEFT JOIN live_class_enrollments lce ON lc.id = lce.live_class_id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += " AND lc.course_id = ?";
      params.push(courseId);
    }
    if (date) {
      query += " AND DATE(lc.scheduled_at) = DATE(?)";
      params.push(date);
    }
    if (upcoming === "true") {
      query += " AND lc.scheduled_at > datetime('now')";
    }

    query += " GROUP BY lc.id ORDER BY lc.scheduled_at ASC";

    return db.all(query, params);
  },

  // Get live class by ID
  async getById(id) {
    return db.get("SELECT * FROM live_classes WHERE id = ?", [id]);
  },

  // Join live class (mock join link + token)
  async joinLiveClass(id, userId) {
    // Ensure enrollment
    await db.run(
      "INSERT OR IGNORE INTO live_class_enrollments (live_class_id, user_id) VALUES (?, ?)",
      [id, userId]
    );

    return {
      joinUrl: `https://live-platform.com/class/${id}`,
      token: `token_${userId}_${id}_${Date.now()}`,
      chatEnabled: true,
      pollsEnabled: true,
    };
  },

  // Save questions during live class
  async askQuestion(liveClassId, userId, question, timestamp) {
    const result = await db.run(
      `INSERT INTO live_class_questions (live_class_id, user_id, question, timestamp)
       VALUES (?, ?, ?, ?)`,
      [liveClassId, userId, question, timestamp]
    );
    return result.lastID;
  },
};

module.exports = LiveClass;
