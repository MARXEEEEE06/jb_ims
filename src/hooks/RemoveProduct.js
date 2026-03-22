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
  console.log('RemoveProducts connected to MySQL Database');
});

router.delete('/:productId', (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    const sql = 'DELETE FROM prod_dtls WHERE product_id = ?';
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product removed successfully', productId });
    });
});

module.exports = router;