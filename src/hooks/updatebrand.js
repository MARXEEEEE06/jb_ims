const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

router.post('/', (req, res) => {
  const { brand_id, brand_name, description = '' } = req.body;
  const userId = req.user?.user_id ?? null;

  if (!brand_id || !brand_name) return res.status(400).json({ error: 'Missing required fields' });

  // Fetch before-state for logging
  db.query(`SELECT brand_name, description FROM BRAND WHERE brand_id = ?`, [brand_id], (err, beforeRows) => {
    const before = beforeRows?.[0] ?? {};

    db.query(
      `UPDATE BRAND SET brand_name = ?, description = ? WHERE brand_id = ?`,
      [brand_name, description, brand_id],
      (err) => {
        if (err) return res.status(500).json({ error: 'Server error' });

        logActivity(userId, 'BRAND_UPDATE', 'brand', Number(brand_id), {
          before: { brand_name: before.brand_name, description: before.description },
          after: { brand_name, description },
        });

        res.json({ message: 'Brand updated' });
      }
    );
  });
});

module.exports = router;
