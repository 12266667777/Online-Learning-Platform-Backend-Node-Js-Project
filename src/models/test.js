const db = require("../config/database");

const Test = {
  // Fetch available tests with filters
  async getTests({ courseId, type, subject }) {
    let query = `
      SELECT t.id, t.title, t.type, t.duration, t.max_marks as maxMarks,
             t.difficulty, COUNT(q.id) as questions,
             COUNT(DISTINCT ta.user_id) as attemptedBy,
             AVG(ta.score) as avgScore
      FROM tests t
      LEFT JOIN test_questions q ON t.id = q.test_id
      LEFT JOIN test_attempts ta ON t.id = ta.test_id
      WHERE 1=1
    `;
    const params = [];

    if (courseId) {
      query += " AND t.course_id = ?";
      params.push(courseId);
    }
    if (type) {
      query += " AND t.type = ?";
      params.push(type);
    }
    if (subject) {
      query += " AND t.subject = ?";
      params.push(subject);
    }

    query += " GROUP BY t.id ORDER BY t.created_at DESC";

    return db.all(query, params);
  },

  // Get test details (questions included)
  async getTestById(testId) {
    const test = await db.get("SELECT * FROM tests WHERE id = ?", [testId]);
    if (!test) return null;

    const questions = await db.all(
      "SELECT id, question, options, marks, negative_marks as negativeMarks FROM test_questions WHERE test_id = ?",
      [testId]
    );

    return { ...test, questions };
  },

  // Start a test session
  async startTest(testId, userId) {
    const test = await this.getTestById(testId);
    if (!test) return null;

    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + test.duration * 60000).toISOString();
    const sessionId = `TEST_${testId}_${userId}_${Date.now()}`;

    await db.run(
      `INSERT INTO test_sessions (session_id, test_id, user_id, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, testId, userId, startTime, endTime]
    );

    return { sessionId, startTime, endTime, questions: test.questions };
  },

  // Submit test answers
  async submitTest(sessionId, userId, answers, timeSpent) {
    const session = await db.get(
      "SELECT * FROM test_sessions WHERE session_id = ? AND user_id = ?",
      [sessionId, userId]
    );
    if (!session) return null;

    const questions = await db.all(
      "SELECT id, correct_option, marks, negative_marks as negativeMarks, subject FROM test_questions WHERE test_id = ?",
      [session.test_id]
    );

    let score = 0,
      correct = 0,
      incorrect = 0,
      unattempted = 0;
    const subjectAnalysis = {};

    for (const q of questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      if (!answer) {
        unattempted++;
        continue;
      }

      if (answer.selectedOption === q.correct_option) {
        score += q.marks;
        correct++;
        subjectAnalysis[q.subject] = subjectAnalysis[q.subject] || { score: 0, attempts: 0, correct: 0 };
        subjectAnalysis[q.subject].score += q.marks;
        subjectAnalysis[q.subject].correct++;
      } else {
        score -= q.negativeMarks;
        incorrect++;
      }

      subjectAnalysis[q.subject] = subjectAnalysis[q.subject] || { score: 0, attempts: 0, correct: 0 };
      subjectAnalysis[q.subject].attempts++;
    }

    // Save attempt
    await db.run(
      `INSERT INTO test_attempts (test_id, user_id, score, time_spent)
       VALUES (?, ?, ?, ?)`,
      [session.test_id, userId, score, timeSpent]
    );

    // Calculate rank and percentile (mock version for now)
    const attempts = await db.all("SELECT score FROM test_attempts WHERE test_id = ?", [session.test_id]);
    const sortedScores = attempts.map((a) => a.score).sort((a, b) => b - a);
    const rank = sortedScores.indexOf(score) + 1;
    const percentile = ((attempts.length - rank) / attempts.length) * 100;

    const result = {
      score,
      maxScore: questions.reduce((sum, q) => sum + q.marks, 0),
      rank,
      percentile: parseFloat(percentile.toFixed(2)),
      correct,
      incorrect,
      unattempted,
      analysis: {},
    };

    for (const [subject, data] of Object.entries(subjectAnalysis)) {
      result.analysis[subject] = {
        score: data.score,
        accuracy: data.attempts ? `${Math.round((data.correct / data.attempts) * 100)}%` : "0%",
      };
    }

    return result;
  },
};

module.exports = Test;
