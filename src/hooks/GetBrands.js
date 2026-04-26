const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) throw err;
  console.log('GetBrands connected to MySQL Database');
});

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