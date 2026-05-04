const express = require('express');
const router = express.Router();
const db = require('./DB.js');
const logActivity = require('./src/hooks/logger.js');
const verifyToken = require('./Auth.js');

router.post('/', verifyToken, (req, res) => {
    const { brand_id, brand_name, description = '' } = req.body;
    const userId = req.user?.user_id ?? null;

    if (!brand_id || !brand_name) return res.status(400).json({ error: 'Missing required fields' });

    db.query(
        `UPDATE BRAND SET brand_name = ?, description = ? WHERE brand_id = ?`,
        [brand_name, description, brand_id],
        (err) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            logActivity(userId, 'BRAND_UPDATE', 'brand', brand_id, { brand_name, description });
            res.json({ message: 'Brand updated' });
        }
    );
});

router.post('/status/:brand_id', verifyToken, (req, res) => {
    const { brand_id } = req.params;
    const userId = req.user?.user_id ?? null;

    db.query(`SELECT brand_name, status FROM BRAND WHERE brand_id = ?`, [brand_id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!rows.length) return res.status(404).json({ error: 'Brand not found' });

        const before = rows[0];
        const newStatus = before.status === 'active' ? 'inactive' : 'active';

        db.query(`UPDATE BRAND SET status = ? WHERE brand_id = ?`, [newStatus, brand_id], (err) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            logActivity(userId, 'BRAND_UPDATE', 'brand', Number(brand_id), {
                name: before.brand_name,
                field: 'status',
                before: before.status,
                after: newStatus,
            });

            res.json({ message: `Status updated to ${newStatus}`, status: newStatus });
        });
    });
});

module.exports = router;