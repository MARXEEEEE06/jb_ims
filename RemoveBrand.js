const express = require('express');
const router = express.Router();
const db = require('./db');

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // ON DELETE SET NULL handles the products side
  db.query(`DELETE FROM BRAND WHERE brand_id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Brand removed' });
  });
});

module.exports = router;