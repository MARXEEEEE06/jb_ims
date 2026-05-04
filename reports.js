const express = require('express');
const router = express.Router();
const db = require('./DB.js');

// GET /api/reports/logs
router.get('/logs', (req, res) => {
  const { user_id, role } = req.user; // from JWT middleware

  const isStaff = role === 'staff';

  const sql = `
    SELECT
        al.log_id,
        al.user_id,
        al.action,
        al.target_type,
        al.target_id,
        al.details,
        DATE_FORMAT(al.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        COALESCE(lc.username, JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.username'))) AS username
    FROM activity_logs al
    LEFT JOIN login_credentials lc ON al.user_id = lc.user_id
    ${isStaff ? 'WHERE al.user_id = ?' : ''}
  ORDER BY al.created_at DESC
  `;

  const params = isStaff ? [user_id] : [];

  db.query(sql, params, (err, results) => {
      if (err) {
          console.error('SQL Error:', err);
          return res.status(500).json({ error: 'Server error' });
      }
      res.json(results);
  });
});

module.exports = router;