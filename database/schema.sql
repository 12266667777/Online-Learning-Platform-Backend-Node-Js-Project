-- ============================================================
-- Online Learning Platform - Database Schema (SQLite3)
-- ============================================================

-- ==============================
-- 1. Users
-- ==============================
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    target_exam TEXT,
    preferred_language TEXT,
    preparation_level TEXT CHECK(preparation_level IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
    role TEXT CHECK(role IN ('learner','educator','admin')) DEFAULT 'learner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- 2. Educators
-- ==============================
CREATE TABLE IF NOT EXISTS educators (
    educator_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subjects_expertise TEXT,
    rating REAL DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    verification_status TEXT CHECK(verification_status IN ('pending','verified','rejected')) DEFAULT 'pending',
    experience_years INTEGER,
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- 3. Courses
-- ==============================
CREATE TABLE IF NOT EXISTS courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    educator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_exam TEXT,
    duration_weeks INTEGER,
    validity_days INTEGER,
    price REAL,
    discount REAL DEFAULT 0.0,
    course_type TEXT CHECK(course_type IN ('recorded','live')) DEFAULT 'recorded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (educator_id) REFERENCES educators(educator_id) ON DELETE CASCADE
);

-- ==============================
-- 4. Lessons
-- ==============================
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER,
    resources_url TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- ==============================
-- 5. Live Classes
-- ==============================
CREATE TABLE IF NOT EXISTS live_classes (
    class_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    educator_id INTEGER NOT NULL,
    scheduled_at DATETIME NOT NULL,
    max_students INTEGER,
    recording_url TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (educator_id) REFERENCES educators(educator_id) ON DELETE CASCADE
);

-- ==============================
-- 6. Enrollments
-- ==============================
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    purchase_date DATE DEFAULT (DATE('now')),
    expiry_date DATE,
    progress_percent REAL DEFAULT 0.0,
    UNIQUE (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- ==============================
-- 7. Watch History
-- ==============================
CREATE TABLE IF NOT EXISTS watch_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_percent REAL DEFAULT 0.0,
    is_completed INTEGER DEFAULT 0, -- 0 = false, 1 = true
    UNIQUE (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);

-- ==============================
-- 8. Tests
-- ==============================
CREATE TABLE IF NOT EXISTS tests (
    test_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER,
    total_marks INTEGER,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- ==============================
-- 9. Test Attempts
-- ==============================
CREATE TABLE IF NOT EXISTS test_attempts (
    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    score INTEGER,
    time_taken_minutes INTEGER,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answer_sheet_json TEXT, -- JSON stored as TEXT
    FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- 10. Subscriptions
-- ==============================
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_type TEXT CHECK(plan_type IN ('plus','iconic')) NOT NULL,
    features_json TEXT,
    price REAL,
    start_date DATE,
    end_date DATE,
    payment_status TEXT CHECK(payment_status IN ('pending','paid','failed')) DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- 11. Doubt Sessions
-- ==============================
CREATE TABLE IF NOT EXISTS doubt_sessions (
    doubt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    educator_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    status TEXT CHECK(status IN ('open','answered','closed')) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (educator_id) REFERENCES educators(educator_id) ON DELETE CASCADE
);

-- ==============================
-- 12. Study Materials
-- ==============================
CREATE TABLE IF NOT EXISTS study_materials (
    material_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT,
    chapter TEXT,
    download_allowed INTEGER DEFAULT 1, -- 0 = false, 1 = true
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- ============================================================
-- ✅ Schema Created Successfully (SQLite3)
-- ============================================================
sqlite3 learning.db