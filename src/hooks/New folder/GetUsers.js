const express = require("express");
const router = express.Router();
const db = require('./db');

// GET all users
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      lc.login_id,
      lc.username,
      ui.user_id,
      ui.email,
      ui.contact_num,
      r.role_type
    FROM login_credentials lc
    JOIN user_info ui ON lc.user_id = ui.user_id
    JOIN role r ON ui.role_id = r.role_id
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