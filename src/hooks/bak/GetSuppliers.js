const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
  db.query(
    `SELECT sup_info_id, name FROM supplier_info WHERE status = 'active' ORDER BY name ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(results);
    }
  );
});

module.exports = router;