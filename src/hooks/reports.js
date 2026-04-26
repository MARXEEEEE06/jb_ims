const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /api/reports/logs
router.get('/logs', (req, res) => {
  const sql = `
    SELECT
      al.log_id,
      al.user_id,
      al.action,
      al.target_type,
      al.target_id,
      al.details,
      al.created_at,
      lc.username
    FROM activity_logs al
    LEFT JOIN login_credentials lc ON al.user_id = lc.user_id
    ORDER BY al.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(results);
  });
});

module.exports = router;