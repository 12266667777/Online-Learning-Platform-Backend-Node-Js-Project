// src/models/doubtModel.js
const db = require("../config/database");

// Create doubt
const createDoubt = async (userId, educatorId, questionText) => {
  const result = await db.run(
    `INSERT INTO doubt_sessions (user_id, educator_id, question_text) 
     VALUES (?, ?, ?)`,
    [userId, educatorId, questionText]
  );
  return { doubt_id: result.lastID };
};

// Get doubts by user
const getDoubtsByUser = async (userId) => {
  return await db.all(
    `SELECT * FROM doubt_sessions WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
};

// Answer a doubt
const answerDoubt = async (doubtId, answerText) => {
  await db.run(
    `UPDATE doubt_sessions SET answer_text = ?, status = 'answered' WHERE doubt_id = ?`,
    [answerText, doubtId]
  );
  return { success: true };
};

module.exports = {
  createDoubt,
  getDoubtsByUser,
  answerDoubt,
};
