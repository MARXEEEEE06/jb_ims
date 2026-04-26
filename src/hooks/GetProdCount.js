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
      COUNT(DISTINCT p.product_id) AS total_products,
      COUNT(DISTINCT si.sup_info_id) AS total_suppliers,
      SUM(v.quantity < 20) AS low_stock
    FROM PRODUCTS p
    LEFT JOIN VARIANTS v ON p.product_id = v.product_id
    LEFT JOIN supplier_items sim ON p.product_id = sim.product_id
    LEFT JOIN supplier_info si ON sim.sup_info_id = si.sup_info_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json(results[0]);
  });
});

module.exports = router;