-- ============================================================
-- Online Learning Platform - Seed Data (SQLite3)
-- ============================================================

-- (No USE statement in SQLite)

-- ==============================
-- 1. Users
-- ==============================
INSERT INTO users (name, email, password_hash, phone, target_exam, preferred_language, preparation_level, role)
VALUES 
('Ravi Kumar', 'ravi@example.com', 'hashedpass123', '9876543210', 'UPSC', 'English', 'intermediate', 'learner'),
('Priya Sharma', 'priya@example.com', 'hashedpass456', '9876501234', 'NEET', 'Hindi', 'beginner', 'learner'),
('Amit Verma', 'amit@example.com', 'hashedpass789', '9876505678', 'JEE', 'English', 'advanced', 'educator'),
('Admin User', 'admin@example.com', 'hashedadmin', '9999999999', NULL, 'English', 'beginner', 'admin');

-- ==============================
-- 2. Educators
-- ==============================
INSERT INTO educators (user_id, subjects_expertise, rating, reviews_count, verification_status, experience_years, bio)
VALUES
(3, 'Physics, Chemistry', 4.8, 120, 'verified', 8, 'Experienced JEE educator with 8 years of teaching Physics and Chemistry.');

-- ==============================
-- 3. Courses
-- ==============================
INSERT INTO courses (educator_id, title, description, target_exam, duration_weeks, validity_days, price, discount, course_type)
VALUES
(1, 'UPSC General Studies', 'Comprehensive UPSC prep course', 'UPSC', 24, 365, 15000, 10.00, 'recorded'),
(1, 'NEET Biology Crash Course', 'Intensive crash course for NEET Biology', 'NEET', 8, 90, 5000, 5.00, 'live');

-- ==============================
-- 4. Lessons
-- ==============================
INSERT INTO lessons (course_id, title, video_url, duration_minutes, order_index, resources_url)
VALUES
(1, 'Indian Polity - Introduction', 'https://videos.com/polity1', 45, 1, 'https://resources.com/polity1.pdf'),
(1, 'Modern History Basics', 'https://videos.com/history1', 50, 2, 'https://resources.com/history1.pdf'),
(2, 'Human Anatomy - Part 1', 'https://videos.com/anatomy1', 60, 1, 'https://resources.com/anatomy1.pdf');

-- ==============================
-- 5. Live Classes
-- ==============================
INSERT INTO live_classes (course_id, educator_id, scheduled_at, max_students, recording_url)
VALUES
(2, 1, '2025-09-10 18:00:00', 200, NULL);

-- ==============================
-- 6. Enrollments
-- ==============================
INSERT INTO enrollments (user_id, course_id, purchase_date, expiry_date, progress_percent)
VALUES
(1, 1, DATE('now'), DATE('now','+365 day'), 10.00),
(2, 2, DATE('now'), DATE('now','+90 day'), 0.00);

-- ==============================
-- 7. Watch History
-- ==============================
INSERT INTO watch_history (user_id, lesson_id, progress_percent, is_completed)
VALUES
(1, 1, 80.00, 0),
(1, 2, 100.00, 1);

-- ==============================
-- 8. Tests
-- ==============================
INSERT INTO tests (course_id, title, description, time_limit_minutes, total_marks)
VALUES
(1, 'UPSC Mock Test 1', 'Preliminary mock test', 120, 200);

-- ==============================
-- 9. Test Attempts
-- ==============================
INSERT INTO test_attempts (test_id, user_id, score, time_taken_minutes, answer_sheet_json)
VALUES
(1, 1, 150, 110, '{"Q1":"A","Q2":"C"}');

-- ==============================
-- 10. Subscriptions
-- ==============================
INSERT INTO subscriptions (user_id, plan_type, features_json, price, start_date, end_date, payment_status)
VALUES
(1, 'plus', '{"downloads":true,"doubts":true}', 999.99, DATE('now'), DATE('now','+30 day'), 'paid'),
(2, 'iconic', '{"mentorship":true,"mock_tests":true}', 1999.99, DATE('now'), DATE('now','+90 day'), 'paid');

-- ==============================
-- 11. Doubt Sessions
-- ==============================
INSERT INTO doubt_sessions (user_id, educator_id, question_text, answer_text, status)
VALUES
(1, 1, 'What is Article 370?', 'Article 370 gave special status to J&K.', 'answered');

-- ==============================
-- 12. Study Materials
-- ==============================
INSERT INTO study_materials (course_id, title, file_url, chapter, download_allowed)
VALUES
(1, 'Polity Notes - Chapter 1', 'https://materials.com/polity_notes1.pdf', 'Polity', 1),
(2, 'Biology Crash Notes', 'https://materials.com/bio_notes.pdf', 'Anatomy', 1);

-- ============================================================
-- ✅ Seed Data Inserted Successfully (SQLite3)
-- ============================================================
