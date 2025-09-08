const bcrypt = require("bcryptjs"); // safer on Windows
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/auth");

const JWT_SECRET = "your_jwt_secret_key"; // 🔑 keep in .env

// Register
const register = (req, res) => {
  const { name, email, password, phone, target_exam, preferred_language, preparation_level, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  findUserByEmail(email, (err, user) => {
    if (user) return res.status(400).json({ error: "Email already exists" });

    const passwordHash = bcrypt.hashSync(password, 10);
    createUser(name, email, passwordHash, phone, target_exam, preferred_language, preparation_level, role, (err, userId) => {
      if (err) return res.status(500).json({ error: "Database error" });

      res.status(201).json({ success: true, userId });
    });
  });
};

// Login
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  findUserByEmail(email, (err, user) => {
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  });
};

module.exports = { register, login };
