const express = require('express');
const router = express.Router();
const db = require('./DB');
const logActivity = require('./Logger');
const verifyToken = require('./Auth');

router.patch('/:variantId', verifyToken, (req, res) => {
    const { variantId } = req.params;
    const { adjustment, type } = req.body;
    const userId = req.user?.user_id ?? null;

    const validTypes = ['RESTOCK', 'CORRECTION'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid adjustment type' });
    }
    if (adjustment === undefined) {
        return res.status(400).json({ error: 'Adjustment value is required' });
    }
    if (type === 'RESTOCK' && Number(adjustment) <= 0) {
        return res.status(400).json({ error: 'Restock must be a positive value' });
    }

    db.query(
        `SELECT v.quantity, v.sku, p.product_id, p.product_name, v.variant
         FROM VARIANTS v
         JOIN PRODUCTS p ON v.product_id = p.product_id
         WHERE v.variant_id = ?`,
        [variantId],
        (err, beforeRows) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            if (!beforeRows.length) return res.status(404).json({ error: 'Variant not found' });

            const { quantity: beforeQty, sku, product_id, product_name, variant } = beforeRows[0];

            db.query(
                `UPDATE VARIANTS SET quantity = GREATEST(0, quantity + ?) WHERE variant_id = ?`,
                [adjustment, variantId],
                (err, results) => {
                    if (err) return res.status(500).json({ error: 'Server error' });
                    if (!results.affectedRows) return res.status(404).json({ error: 'Variant not found' });

                    const afterQty = Math.max(0, beforeQty + Number(adjustment));

                    logActivity(userId, type, 'variant', Number(variantId), {
                        product_id: Number(product_id),
                        sku,
                        product_name,
                        variant,
                        adjustment: Number(adjustment),
                        before: Number(beforeQty),
                        after: Number(afterQty),
                    });

                    res.json({ message: 'Stock updated', variantId });
                }
            );
        }
    );
});

module.exports = router;