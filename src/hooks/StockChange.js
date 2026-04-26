const express = require('express');
const router = express.Router();
const db = require('./db');

// PATCH /api/stock/:variantId
router.patch('/:variantId', (req, res) => {
  const { variantId } = req.params;
  const { adjustment } = req.body;

  if (adjustment === undefined) {
    return res.status(400).json({ error: 'Adjustment value is required' });
  }

  const sql = `
    UPDATE VARIANTS
    SET quantity = GREATEST(0, quantity + ?)
    WHERE variant_id = ?
  `;

  db.query(sql, [adjustment, variantId], (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    res.json({ message: 'Stock updated', variantId });
  });
});

module.exports = router;