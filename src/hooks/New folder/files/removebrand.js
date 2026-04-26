const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.user?.user_id ?? null;

  // Fetch before-state for logging
  db.query(`SELECT brand_name FROM BRAND WHERE brand_id = ?`, [id], (err, beforeRows) => {
    const before = beforeRows?.[0] ?? {};

    db.query(`DELETE FROM BRAND WHERE brand_id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: 'Server error' });

      logActivity(userId, 'BRAND_DELETED', 'brand', Number(id), {
        brand_name: before.brand_name,
      });

      res.json({ message: 'Brand removed' });
    });
  });
});

module.exports = router;
