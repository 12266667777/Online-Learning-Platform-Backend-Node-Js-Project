// src/models/lesson.js
const connectDB = require("../config/database");

class Lesson {
  // Create a new lesson
  static async createLesson({ course_id, title, video_url, duration_minutes, order_index, resources_url }) {
    const db = await connectDB();
    const result = await db.run(
      `INSERT INTO lessons (course_id, title, video_url, duration_minutes, order_index, resources_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [course_id, title, video_url, duration_minutes, order_index, resources_url]
    );
    return { lesson_id: result.lastID };
  }

  // Get all lessons for a course
  static async getLessonsByCourse(course_id) {
    const db = await connectDB();
    const lessons = await db.all(
      `SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC`,
      [course_id]
    );
    return lessons;
  }

  // Get lesson by ID
  static async getLessonById(lesson_id) {
    const db = await connectDB();
    const lesson = await db.get(`SELECT * FROM lessons WHERE lesson_id = ?`, [lesson_id]);
    return lesson;
  }

  // Update lesson
  static async updateLesson(lesson_id, updates) {
    const db = await connectDB();
    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });

    values.push(lesson_id);

    const query = `UPDATE lessons SET ${fields.join(", ")} WHERE lesson_id = ?`;
    await db.run(query, values);

    return this.getLessonById(lesson_id);
  }

  // Delete lesson
  static async deleteLesson(lesson_id) {
    const db = await connectDB();
    const result = await db.run(`DELETE FROM lessons WHERE lesson_id = ?`, [lesson_id]);
    return result.changes > 0;
  }
}

module.exports = Lesson;
