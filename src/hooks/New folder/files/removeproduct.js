const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

router.delete('/:variantId', (req, res) => {
  const { variantId } = req.params;
  const userId = req.user?.user_id ?? null;

  if (!variantId) return res.status(400).json({ error: 'Variant ID is required' });

  // Fetch before-state for logging
  db.query(
    `SELECT v.variant_id, v.variant, v.sku, p.product_id, p.product_name, b.brand_name
     FROM VARIANTS v
     JOIN PRODUCTS p ON v.product_id = p.product_id
     LEFT JOIN BRAND b ON p.brand_id = b.brand_id
     WHERE v.variant_id = ?`,
    [variantId],
    (err, beforeRows) => {
      const before = beforeRows?.[0] ?? {};

      // Step 1: Get product_id
      db.query(`SELECT product_id FROM VARIANTS WHERE variant_id = ?`, [variantId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Variant not found' });

        const product_id = results[0].product_id;

        // Step 2: Delete the variant
        db.query(`DELETE FROM VARIANTS WHERE variant_id = ?`, [variantId], (err) => {
          if (err) return res.status(500).json({ error: 'Server error' });

          // Step 3: Check remaining variants
          db.query(`SELECT COUNT(*) AS count FROM VARIANTS WHERE product_id = ?`, [product_id], (err, countResult) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            const remaining = countResult[0].count;

            if (remaining === 0) {
              db.query(`SELECT category_id FROM PRODUCTS WHERE product_id = ?`, [product_id], (err, prodResult) => {
                if (err) return res.status(500).json({ error: 'Server error' });

                const category_id = prodResult[0]?.category_id;

                db.query(`DELETE FROM supplier_items WHERE product_id = ?`, [product_id], (err) => {
                  if (err) return res.status(500).json({ error: 'Server error' });

                  db.query(`DELETE FROM PRODUCTS WHERE product_id = ?`, [product_id], (err) => {
                    if (err) return res.status(500).json({ error: 'Server error' });

                    db.query(`SELECT COUNT(*) AS count FROM PRODUCTS WHERE category_id = ?`, [category_id], (err, catCount) => {
                      if (err) return res.status(500).json({ error: 'Server error' });

                      const finish = (msg) => {
                        logActivity(userId, 'PRODUCT_DELETED', 'product', product_id, {
                          variant_id: Number(variantId),
                          sku: before.sku,
                          product_name: before.product_name,
                          brand: before.brand_name,
                          variant: before.variant,
                          product_also_deleted: true,
                        });
                        res.json({ message: msg, variantId });
                      };

                      if (catCount[0].count === 0) {
                        db.query(`DELETE FROM CATEGORY WHERE category_id = ?`, [category_id], (err) => {
                          if (err) return res.status(500).json({ error: 'Server error' });
                          finish('Variant, product, supplier link, and orphaned category removed');
                        });
                      } else {
                        finish('Variant, product, and supplier link removed');
                      }
                    });
                  });
                });
              });
            } else {
              logActivity(userId, 'PRODUCT_DELETED', 'variant', Number(variantId), {
                sku: before.sku,
                product_name: before.product_name,
                brand: before.brand_name,
                variant: before.variant,
                product_also_deleted: false,
              });
              res.json({ message: 'Variant removed', variantId });
            }
          });
        });
      });
    }
  );
});

module.exports = router;
