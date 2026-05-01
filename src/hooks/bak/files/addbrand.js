// addbrand.js
const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

router.post('/', (req, res) => {
  const { brand_name, description = '' } = req.body;
  const userId = req.user?.user_id ?? null;

  if (!brand_name) return res.status(400).json({ error: 'Brand name is required' });

  db.query(
    `INSERT INTO BRAND (brand_name, description) VALUES (?, ?)`,
    [brand_name, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Server error' });

      logActivity(userId, 'BRAND_CREATED', 'brand', result.insertId, {
        brand_name,
        description,
      });

      res.json({ message: 'Brand added', brand_id: result.insertId });
    }
  );
});

module.exports = router;
