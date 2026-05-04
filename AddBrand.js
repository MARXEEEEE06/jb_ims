// addbrand.js
const express = require('express');
const router = express.Router();
const db = require('./DB.js');
const logActivity = require('./src/hooks/logger.js');
const verifyToken = require('./Auth.js');

router.post('/', verifyToken, (req, res) => {
    const { brand_name, description = '' } = req.body;
    const userId = req.user?.user_id ?? null;

    if (!brand_name) return res.status(400).json({ error: 'Brand name is required' });

    db.query(
        `INSERT INTO BRAND (brand_name, description) VALUES (?, ?)`,
        [brand_name, description],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY')
                    return res.status(400).json({ error: 'Brand already exists' });
                return res.status(500).json({ error: 'Server error' });
            }

            logActivity(userId, 'BRAND_CREATED', 'brand', result.insertId, {
                brand_name,
                description,
            });

            res.json({ message: 'Brand added', brand_id: result.insertId });
        }
    );
});

module.exports = router;
