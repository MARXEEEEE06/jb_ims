const express = require('express');
const mysql = require('mysql');

const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'marx',
  password: '12345678',
  database: 'ims_db',
});

db.connect(err => {
  if (err) throw err;
  console.log('StockChange connected to MySQL Database');
});

router.patch('/:id', (req, res) => {
    const { id } = req.params;          // ✅
    const { adjustment } = req.body;

    const sql = `
        UPDATE prod_dtls 
        SET stock_quantity = GREATEST(0, stock_quantity + ?)
        WHERE product_id = ?
    `;

    db.query(sql, [adjustment, id], (err, results) => {  // ✅
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Stock updated' });
    });
});

module.exports = router;