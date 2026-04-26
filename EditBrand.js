const express = require('express');
const router = express.Router();
const db = require('./db');


router.post('/', (req, res) => {
  const { brand_id, brand_name, description = '' } = req.body;

  if (!brand_id || !brand_name) return res.status(400).json({ error: 'Missing required fields' });

  db.query(
    `UPDATE BRAND SET brand_name = ?, description = ? WHERE brand_id = ?`,
    [brand_name, description, brand_id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json({ message: 'Brand updated' });
    }
  );
});

module.exports = router;