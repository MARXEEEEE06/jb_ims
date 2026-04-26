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
  console.log('Inventory connected to MySQL Database');
});

function getStatus(quantity) {
  if (quantity === 0) return 'OUT OF STOCK';
  if (quantity < 10) return 'CRITICAL';
  if (quantity < 20) return 'LOW';
  return 'IN-STOCK';
}

// POST /api/inventory
router.post('/', (req, res) => {
  const sql = `
  SELECT 
    v.variant_id,
    v.sku,
    v.variant,
    v.price,
    v.quantity,
    p.product_id,
    p.product_name,
    b.brand_name AS brand,
    c.category_type,
    u.unit_type,
    si.name AS supplier
    FROM VARIANTS v
    JOIN PRODUCTS p ON v.product_id = p.product_id
    LEFT JOIN BRAND b ON p.brand_id = b.brand_id
    LEFT JOIN CATEGORY c ON p.category_id = c.category_id
    LEFT JOIN UNIT u ON v.unit_id = u.unit_id
    LEFT JOIN supplier_items sim ON p.product_id = sim.product_id
    LEFT JOIN supplier_info si ON sim.sup_info_id = si.sup_info_id AND si.status = 'active'
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No items found.' });
    }

    const items = results.map(item => ({
      ...item,
      status: getStatus(item.quantity)
    }));

    res.json(items);
  });
});

module.exports = router;