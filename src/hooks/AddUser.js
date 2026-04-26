const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("AddUser connected to MySQL Database");
});

// POST a new user
router.post("/", (req, res) => {
  const {
    username,
    password,
    email = "",
    contact_num = "",
    role_id = 2 // default to staff
  } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // First insert into user_info
  const userInfoSql = `
    INSERT INTO user_info (email, contact_num, role_id)
    VALUES (?, ?, ?)
  `;

  db.query(userInfoSql, [email, contact_num, role_id], (err, result) => {
    if (err) {
      console.error("SQL Error (user_info):", err);
      return res.status(500).json({ error: "Server error inserting user info" });
    }

    const user_id = result.insertId; // ← was user_info_id

    const loginSql = `
      INSERT INTO login_credentials (user_id, username, password)
      VALUES (?, ?, ?)
    `;

    db.query(loginSql, [user_id, username, password], (err, loginResult) => {
      if (err) {
        console.error("SQL Error (login_credentials):", err);
        return res.status(500).json({ error: "Server error inserting login credentials" });
      }

      res.json({
        message: "User added successfully",
        user_id: user_id,
        login_id: loginResult.insertId,
      });
    });
  });
});

module.exports = router;