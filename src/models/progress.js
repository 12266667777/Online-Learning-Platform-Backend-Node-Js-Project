const db = require("../config/database");

const Progress = {
  // Get overall dashboard
  async getDashboard(userId) {
    // Streak Days (simplified: distinct watch days in last 30 days)
    const streak = await db.get(
      `SELECT COUNT(DISTINCT DATE(last_watched_at)) as streakDays
       FROM watch_history WHERE user_id = ? 
       AND last_watched_at >= DATE('now', '-30 day')`,
      [userId]
    );

    // Total watch time
    const watchTime = await db.get(
      `SELECT SUM(duration_minutes * (progress_percent / 100.0)) as totalWatchTime
       FROM lessons l
       JOIN watch_history w ON l.lesson_id = w.lesson_id
       WHERE w.user_id = ?`,
      [userId]
    );

    // Courses enrolled
    const courses = await db.get(
      `SELECT COUNT(*) as coursesEnrolled,
              SUM(CASE WHEN progress_percent = 100 THEN 1 ELSE 0 END) as coursesCompleted
       FROM enrollments WHERE user_id = ?`,
      [userId]
    );

    // Upcoming classes
    const upcoming = await db.get(
      `SELECT COUNT(*) as upcomingClasses
       FROM live_classes
       WHERE scheduled_at > DATETIME('now')
       AND course_id IN (SELECT course_id FROM enrollments WHERE user_id = ?)`,
      [userId]
    );

    // Pending tests
    const pendingTests = await db.get(
      `SELECT COUNT(*) as pendingTests
       FROM tests t
       WHERE t.course_id IN (SELECT course_id FROM enrollments WHERE user_id = ?)
       AND NOT EXISTS (
         SELECT 1 FROM test_attempts ta WHERE ta.test_id = t.test_id AND ta.user_id = ?
       )`,
      [userId, userId]
    );

    // Weekly progress (7 days)
    const weekly = await db.all(
      `SELECT strftime('%w', last_watched_at) as day,
              SUM(duration_minutes * (progress_percent/100.0)) as watchTime,
              SUM(CASE WHEN is_completed=1 THEN 1 ELSE 0 END) as lessonsCompleted
       FROM watch_history w
       JOIN lessons l ON w.lesson_id = l.lesson_id
       WHERE w.user_id = ?
       AND w.last_watched_at >= DATE('now', '-6 day')
       GROUP BY day`,
      [userId]
    );

    const weeklyProgress = {
      watchTime: [0, 0, 0, 0, 0, 0, 0],
      lessonsCompleted: [0, 0, 0, 0, 0, 0, 0]
    };
    weekly.forEach(r => {
      weeklyProgress.watchTime[parseInt(r.day)] = r.watchTime || 0;
      weeklyProgress.lessonsCompleted[parseInt(r.day)] = r.lessonsCompleted || 0;
    });

    return {
      streakDays: streak.streakDays || 0,
      totalWatchTime: watchTime.totalWatchTime || 0,
      coursesEnrolled: courses.coursesEnrolled || 0,
      coursesCompleted: courses.coursesCompleted || 0,
      upcomingClasses: upcoming.upcomingClasses || 0,
      pendingTests: pendingTests.pendingTests || 0,
      weeklyProgress
    };
  },

  // Get progress for a specific course
  async getCourseProgress(userId, courseId) {
    const enrollment = await db.get(
      `SELECT purchase_date as enrolledOn, expiry_date as validity, progress_percent as overallProgress
       FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    if (!enrollment) return null;

    const lessons = await db.get(
      `SELECT COUNT(*) as totalLessons FROM lessons WHERE course_id = ?`,
      [courseId]
    );

    const completedLessons = await db.get(
      `SELECT COUNT(*) as completedLessons
       FROM watch_history w
       JOIN lessons l ON w.lesson_id = l.lesson_id
       WHERE w.user_id = ? AND l.course_id = ? AND w.is_completed = 1`,
      [userId, courseId]
    );

    const tests = await db.get(
      `SELECT COUNT(*) as testsAttempted, AVG(score) as avgTestScore
       FROM test_attempts ta
       JOIN tests t ON ta.test_id = t.test_id
       WHERE ta.user_id = ? AND t.course_id = ?`,
      [userId, courseId]
    );

    return {
      courseId,
      enrolledOn: enrollment.enrolledOn,
      validity: enrollment.validity,
      overallProgress: enrollment.overallProgress,
      chapters: [
        {
          name: "Course Progress",
          progress: lessons.totalLessons
            ? Math.round((completedLessons.completedLessons / lessons.totalLessons) * 100)
            : 0,
          completedLessons: completedLessons.completedLessons || 0,
          totalLessons: lessons.totalLessons || 0
        }
      ],
      testsAttempted: tests.testsAttempted || 0,
      avgTestScore: tests.avgTestScore || 0,
      certificateEligible: enrollment.overallProgress >= 80
    };
  }
};

module.exports = Progress;
