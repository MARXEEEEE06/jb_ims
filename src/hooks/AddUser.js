const express = require("express");
const router = express.Router();
const mysql = require("mysql");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "marx",
  password: "12345678",
  database: "ims_db",
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

    const user_info_id = result.insertId;

    // Then insert into login_credentials
    const loginSql = `
      INSERT INTO login_credentials (user_info_id, username, password)
      VALUES (?, ?, ?)
    `;

    db.query(loginSql, [user_info_id, username, password], (err, loginResult) => {
      if (err) {
        console.error("SQL Error (login_credentials):", err);
        return res.status(500).json({ error: "Server error inserting login credentials" });
      }

      res.json({
        message: "User added successfully",
        user_id: user_info_id,
        login_id: loginResult.insertId,
      });
    });
  });
});

module.exports = router;