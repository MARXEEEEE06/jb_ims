const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
  db.query(`
    SELECT 
      b.brand_id, 
      b.brand_name, 
      b.description,
      COUNT(p.product_id) AS total_products
    FROM BRAND b
    LEFT JOIN PRODUCTS p ON b.brand_id = p.brand_id
    GROUP BY b.brand_id
    ORDER BY b.brand_name ASC
  `, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

module.exports = router;