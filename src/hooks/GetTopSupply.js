const express = require('express');
const router = express.Router();

// GET top 10 products by stock
router.get('/', (req, res) => {
    const sql = `
        SELECT prod_name, stock_quantity
        FROM prod_dtls
        ORDER BY stock_quantity DESC
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