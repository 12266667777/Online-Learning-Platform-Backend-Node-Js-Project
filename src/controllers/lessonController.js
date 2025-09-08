// src/controllers/lessonController.js
const Lesson = require("../models/lesson");
const connectDB = require("../config/database");

module.exports = {
  // GET /api/lessons/:id
  getLessonDetails: async (req, res, next) => {
    try {
      const userId = req.user.user_id; // from auth middleware
      const lessonId = req.params.id;
      const db = await connectDB();

      // Check if user is enrolled in the course of this lesson
      const lesson = await db.get(
        `SELECT l.*, c.course_id
         FROM lessons l
         JOIN courses c ON l.course_id = c.course_id
         WHERE l.lesson_id = ?`,
        [lessonId]
      );

      if (!lesson) {
        return res.status(404).json({ success: false, message: "Lesson not found" });
      }

      const enrollment = await db.get(
        `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?`,
        [userId, lesson.course_id]
      );

      if (!enrollment) {
        return res.status(403).json({ success: false, message: "Not enrolled in this course" });
      }

      // Fetch next lesson (if exists)
      const nextLesson = await db.get(
        `SELECT lesson_id, title FROM lessons 
         WHERE course_id = ? AND order_index > ?
         ORDER BY order_index ASC LIMIT 1`,
        [lesson.course_id, lesson.order_index]
      );

      // Mock resources for now (could be another table)
      const resources = lesson.resources_url
        ? [
            {
              type: "pdf",
              title: "Mechanics Notes",
              url: lesson.resources_url,
            },
          ]
        : [];

      return res.json({
        success: true,
        lesson: {
          id: lesson.lesson_id,
          title: lesson.title,
          description: lesson.description || "No description",
          videoUrl: lesson.video_url,
          duration: lesson.duration_minutes ? lesson.duration_minutes * 60 : null,
          resources,
          nextLesson: nextLesson
            ? {
                id: nextLesson.lesson_id,
                title: nextLesson.title,
              }
            : null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/lessons/:id/progress
  updateLessonProgress: async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const lessonId = req.params.id;
      const { watchedDuration, totalDuration, completed } = req.body;

      const progressPercent = Math.min((watchedDuration / totalDuration) * 100, 100);

      const db = await connectDB();

      await db.run(
        `INSERT INTO watch_history (user_id, lesson_id, progress_percent, is_completed)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id, lesson_id)
         DO UPDATE SET progress_percent = excluded.progress_percent,
                       is_completed = excluded.is_completed,
                       last_watched_at = CURRENT_TIMESTAMP`,
        [userId, lessonId, progressPercent, completed ? 1 : 0]
      );

      return res.json({
        success: true,
        message: "Progress updated successfully",
        progress: progressPercent,
        completed,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/lessons/:id/notes
  saveLessonNotes: async (req, res, next) => {
    try {
      const userId = req.user.user_id;
      const lessonId = req.params.id;
      const { timestamp, note } = req.body;
      const db = await connectDB();

      // Create notes table if not exists
      await db.run(
        `CREATE TABLE IF NOT EXISTS lesson_notes (
          note_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          lesson_id INTEGER NOT NULL,
          timestamp_seconds INTEGER,
          note_text TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
        )`
      );

      const result = await db.run(
        `INSERT INTO lesson_notes (user_id, lesson_id, timestamp_seconds, note_text)
         VALUES (?, ?, ?, ?)`,
        [userId, lessonId, timestamp, note]
      );

      return res.json({
        success: true,
        message: "Note saved successfully",
        noteId: result.lastID,
      });
    } catch (err) {
      next(err);
    }
  },
};
