const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

// PATCH /api/stock/:variantId
router.patch('/:variantId', (req, res) => {
  const { variantId } = req.params;
  const { adjustment } = req.body;
  const userId = req.user?.user_id ?? null;

  if (adjustment === undefined) {
    return res.status(400).json({ error: 'Adjustment value is required' });
  }

  // Fetch before-state so we can log before/after
  db.query(
    `SELECT v.quantity, v.sku, v.product_id, p.product_name, v.variant
     FROM VARIANTS v
     JOIN PRODUCTS p ON v.product_id = p.product_id
     WHERE v.variant_id = ?`,
    [variantId],
    (err, beforeRows) => {
      if (err) {
        console.error('SQL Error (before fetch):', err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (beforeRows.length === 0) {
        return res.status(404).json({ error: 'Variant not found' });
      }

      const { quantity: beforeQty, sku, product_id, product_name, variant } = beforeRows[0];

      const sql = `
        UPDATE VARIANTS
        SET quantity = GREATEST(0, quantity + ?)
        WHERE variant_id = ?
      `;

      db.query(sql, [adjustment, variantId], (err2, results) => {
        if (err2) {
          console.error('SQL Error:', err2);
          return res.status(500).json({ error: 'Server error' });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Variant not found' });
        }

        const afterQty = Math.max(0, Number(beforeQty) + Number(adjustment));

        logActivity(userId, 'STOCK_UPDATE', 'variant', Number(variantId), {
          product_id: Number(product_id),
          sku,
          product_name,
          variant,
          adjustment: Number(adjustment),
          before: Number(beforeQty),
          after: Number(afterQty),
        });

        res.json({ message: 'Stock updated', variantId });
      });
    }
  );
});

module.exports = router;
