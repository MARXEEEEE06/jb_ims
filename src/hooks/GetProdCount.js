const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) throw err;
  console.log('GetProdCount connected to MySQL Database');
});

// GET counts for dashboard
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total_products,
      COUNT(DISTINCT supplier) AS total_suppliers,
      SUM(stock_quantity < 20) AS low_stock
    FROM prod_dtls
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json(results[0]); // { total_products, total_suppliers, low_stock }
  });
});

module.exports = router;