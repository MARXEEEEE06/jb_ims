const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

router.patch('/:variantId', (req, res) => {
  const { variantId } = req.params;
  const { adjustment } = req.body;
  const userId = req.user?.user_id ?? null;

  if (adjustment === undefined) {
    return res.status(400).json({ error: 'Adjustment value is required' });
  }

  // Fetch before-state so we can log before/after
  db.query(
    `SELECT v.quantity, v.sku, p.product_name, v.variant
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

      const { quantity: beforeQty, sku, product_name, variant } = beforeRows[0];

      const sql = `
        UPDATE VARIANTS
        SET quantity = GREATEST(0, quantity + ?)
        WHERE variant_id = ?
      `;

      db.query(sql, [adjustment, variantId], (err, results) => {
        if (err) {
          console.error('SQL Error:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Variant not found' });
        }

        // Actual after value — respects GREATEST(0, ...) floor
        const afterQty = Math.max(0, beforeQty + adjustment);

        logActivity(userId, 'STOCK_UPDATE', 'variant', Number(variantId), {
          sku,
          product_name,
          variant,
          adjustment,
          before: beforeQty,
          after: afterQty,
        });

        res.json({ message: 'Stock updated', variantId });
      });
    }
  );
});

module.exports = router;
