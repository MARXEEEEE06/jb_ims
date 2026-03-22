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
  console.log("GetUsers connected to MySQL Database");
});

// GET all users
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      lc.username,
      ui.email,
      ui.contact_num,
      ui.role_id,
      ui.user_info_id
    FROM login_credentials lc
    JOIN user_info ui ON lc.user_info_id = ui.user_info_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    res.json(results);
  });
});

module.exports = router;