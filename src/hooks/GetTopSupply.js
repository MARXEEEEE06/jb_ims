const express = require('express');
const router = express.Router();
const db = require('./db');

// GET top 10 products by stock
router.get('/', (req, res) => {
    const sql = `
        SELECT 
            p.product_name, 
            v.quantity
        FROM variants v
        JOIN products p ON v.product_id = p.product_id
        ORDER BY v.quantity DESC
        LIMIT 10
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});

module.exports = router;