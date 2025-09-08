const db = require("../config/database");

// Get all courses with optional filters
async function getCourses(filters = {}) {
  let query = `
    SELECT
      c.course_id AS id,
      c.title,
      c.description,
      c.target_exam AS targetExam,
      c.duration_weeks AS durationWeeks,
      c.validity_days AS validityDays,
      c.price,
      c.discount,
      e.educator_id AS educatorId,
      u.name AS educatorName,
      e.rating AS educatorRating,
      e.subjects_expertise AS subjectsExpertise
    FROM courses c
    JOIN educators e ON c.educator_id = e.educator_id
    JOIN users u ON e.user_id = u.user_id
    WHERE 1=1
  `;

  const params = [];

  if (filters.exam) {
    query += " AND LOWER(c.target_exam) = LOWER(?)";
    params.push(filters.exam);
  }

  // Sorting
  if (filters.sort === "price") query += " ORDER BY c.price ASC";
  else if (filters.sort === "rating") query += " ORDER BY e.rating DESC";
  else query += " ORDER BY c.created_at DESC";

  return db.all(query, params);
}

// Get single course by ID with syllabus
async function getCourseById(courseId) {
  const course = await db.get(
    `SELECT
      c.course_id AS id,
      c.title,
      c.description,
      c.target_exam AS targetExam,
      c.duration_weeks AS durationWeeks,
      c.validity_days AS validityDays,
      c.price,
      c.discount,
      e.educator_id AS educatorId,
      u.name AS educatorName,
      e.bio AS educatorBio,
      e.experience_years AS experienceYears,
      e.rating AS educatorRating
    FROM courses c
    JOIN educators e ON c.educator_id = e.educator_id
    JOIN users u ON e.user_id = u.user_id
    WHERE c.course_id = ?`,
    [courseId]
  );

  if (!course) return null;

  const lessons = await db.all(
    `SELECT
      l.lesson_id AS id,
      l.title,
      l.video_url AS videoUrl,
      l.duration_minutes AS duration,
      l.order_index,
      l.resources_url AS resource
    FROM lessons l
    WHERE l.course_id = ?
    ORDER BY l.order_index`,
    [courseId]
  );

  const syllabus = lessons.reduce((acc, lesson) => {
    const chapter = "General"; // For simplicity, all lessons under "General"
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration ? `${lesson.duration} mins` : null,
      videoUrl: lesson.videoUrl,
      resource: lesson.resource,
      isFree: lesson.order_index === 1,
    });
    return acc;
  }, {});

  return { ...course, syllabus };
}

// Add default lessons if none exist
async function addDefaultLessons(courseId) {
  const defaultLessons = [
    {
      title: "Introduction Lesson",
      video_url: "https://videos.com/default1",
      duration_minutes: 30,
      order_index: 1,
      resources_url: "https://resources.com/default1.pdf",
    },
    {
      title: "Second Lesson",
      video_url: "https://videos.com/default2",
      duration_minutes: 40,
      order_index: 2,
      resources_url: "https://resources.com/default2.pdf",
    },
  ];

  for (const lesson of defaultLessons) {
    await db.run(
      `INSERT INTO lessons (course_id, title, video_url, duration_minutes, order_index, resources_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [courseId, lesson.title, lesson.video_url, lesson.duration_minutes, lesson.order_index, lesson.resources_url]
    );
  }

  return await getCourseById(courseId);
}

module.exports = {
  getCourses,
  getCourseById,
  addDefaultLessons,
};
