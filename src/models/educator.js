const db = require("../config/database");

const Educator = {
  // Browse educators with filters
  async getEducators({ subject, exam, rating }) {
    let query = `
      SELECT e.educator_id as id, u.name, u.target_exam, u.preferred_language,
             e.subjects_expertise as subjects, e.experience_years as experience,
             e.rating, e.verification_status,
             (SELECT COUNT(*) FROM enrollments en
                JOIN courses c ON en.course_id = c.course_id
                WHERE c.educator_id = e.educator_id) as totalStudents,
             (SELECT COUNT(*) FROM courses c WHERE c.educator_id = e.educator_id) as courses,
             u.role, u.user_id
      FROM educators e
      JOIN users u ON e.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (subject) {
      query += " AND e.subjects_expertise LIKE ?";
      params.push(`%${subject}%`);
    }
    if (exam) {
      query += " AND u.target_exam = ?";
      params.push(exam);
    }
    if (rating) {
      query += " AND e.rating >= ?";
      params.push(rating);
    }

    return db.all(query, params);
  },

  // Get single educator profile
  async getEducatorById(id) {
    const educator = await db.get(
      `SELECT e.educator_id as id, u.name, u.email, e.subjects_expertise as subjects,
              e.experience_years as experience, e.rating, e.reviews_count,
              e.bio, e.verification_status,
              (SELECT COUNT(*) FROM enrollments en
                JOIN courses c ON en.course_id = c.course_id
                WHERE c.educator_id = e.educator_id) as totalStudents,
              (SELECT COUNT(*) FROM courses c WHERE c.educator_id = e.educator_id) as courses
       FROM educators e
       JOIN users u ON e.user_id = u.user_id
       WHERE e.educator_id = ?`,
      [id]
    );
    return educator;
  },

  // Follow educator
  async followEducator(userId, educatorId) {
    try {
      await db.run(
        `INSERT INTO educator_followers (user_id, educator_id) VALUES (?, ?)`,
        [userId, educatorId]
      );
      return true;
    } catch (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return false; // already following
      }
      throw err;
    }
  },
};

module.exports = Educator;
