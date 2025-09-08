const db = require("../config/database");

// Create user
const createUser = (name, email, passwordHash, phone, target_exam, preferred_language, preparation_level, role, callback) => {
  const query = `
    INSERT INTO users (name, email, password_hash, phone, target_exam, preferred_language, preparation_level, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [name, email, passwordHash, phone, target_exam, preferred_language, preparation_level, role], function (err) {
    callback(err, this ? this.lastID : null);
  });
};

// Find user by email
const findUserByEmail = (email, callback) => {
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    callback(err, row);
  });
};

module.exports = { createUser, findUserByEmail };
