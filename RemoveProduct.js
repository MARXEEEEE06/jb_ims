const express = require('express');
const router = express.Router();
const db = require('./DB.js');
const logActivity = require('./src/hooks/logger.js');

router.delete('/:variantId', (req, res) => {
  const { variantId } = req.params;
  const userId = req.user?.user_id ?? null;

  if (!variantId) return res.status(400).json({ error: 'Variant ID is required' });

  db.query(
    `SELECT v.variant_id, v.variant, v.sku, p.product_id, p.product_name, b.brand_name
     FROM VARIANTS v
     JOIN PRODUCTS p ON v.product_id = p.product_id
     LEFT JOIN BRAND b ON p.brand_id = b.brand_id
     WHERE v.variant_id = ?`,
    [variantId],
    (beforeErr, beforeRows) => {
      if (beforeErr) console.error('SQL Error (before fetch):', beforeErr);
      const before = beforeRows?.[0] ?? {};

      db.query(`SELECT product_id FROM VARIANTS WHERE variant_id = ?`, [variantId], (err, results) => {
        if (err) {
          console.error('SQL Error (variant lookup):', err);
          return res.status(500).json({ error: 'Server error' });
        }
        if ((results?.length ?? 0) === 0) return res.status(404).json({ error: 'Variant not found' });

        const product_id = results[0].product_id;

        db.query(`DELETE FROM TRANSACTION WHERE variant_id = ?`, [variantId], (txDelErr) => {
          if (txDelErr) {
            console.error('SQL Error (transaction delete):', txDelErr);
            return res.status(500).json({ error: 'Server error' });
          }

          db.query(`DELETE FROM VARIANTS WHERE variant_id = ?`, [variantId], (delErr) => {
            if (delErr) {
              console.error('SQL Error (variant delete):', delErr);
              return res.status(500).json({ error: 'Server error' });
            }

            db.query(`SELECT COUNT(*) AS count FROM VARIANTS WHERE product_id = ?`, [product_id], (countErr, countRows) => {
              if (countErr) {
                console.error('SQL Error (remaining variants):', countErr);
                return res.status(500).json({ error: 'Server error' });
              }

              const remaining = Number(countRows?.[0]?.count ?? 0);

              if (remaining > 0) {
                logActivity(userId, 'PRODUCT_DELETED', 'variant', Number(variantId), {
                  sku: before.sku,
                  product_name: before.product_name,
                  brand: before.brand_name,
                  variant: before.variant,
                  product_also_deleted: false,
                });
                return res.json({ message: 'Variant removed', variantId });
              }

              db.query(`SELECT category_id FROM PRODUCTS WHERE product_id = ?`, [product_id], (prodErr, prodRows) => {
                if (prodErr) {
                  console.error('SQL Error (product fetch):', prodErr);
                  return res.status(500).json({ error: 'Server error' });
                }

                const category_id = prodRows?.[0]?.category_id ?? null;

                db.query(`DELETE FROM supplier_items WHERE product_id = ?`, [product_id], (supErr) => {
                  if (supErr) {
                    console.error('SQL Error (supplier_items delete):', supErr);
                    return res.status(500).json({ error: 'Server error' });
                  }

                  db.query(`DELETE FROM PRODUCTS WHERE product_id = ?`, [product_id], (prodDelErr) => {
                    if (prodDelErr) {
                      console.error('SQL Error (product delete):', prodDelErr);
                      return res.status(500).json({ error: 'Server error' });
                    }

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

                    if (!category_id) return finish('Variant, product, and supplier link removed');

                    db.query(`SELECT COUNT(*) AS count FROM PRODUCTS WHERE category_id = ?`, [category_id], (catErr, catRows) => {
                      if (catErr) {
                        console.error('SQL Error (category count):', catErr);
                        return res.status(500).json({ error: 'Server error' });
                      }

                      if (Number(catRows?.[0]?.count ?? 0) === 0) {
                        db.query(`DELETE FROM CATEGORY WHERE category_id = ?`, [category_id], (catDelErr) => {
                          if (catDelErr) {
                            console.error('SQL Error (category delete):', catDelErr);
                            return res.status(500).json({ error: 'Server error' });
                          }
                          finish('Variant, product, supplier link, and orphaned category removed');
                        });
                      } else {
                        finish('Variant, product, and supplier link removed');
                      }
                    });
                  });
                });
              });
            });
          });
        });
      });
    }
  );
});

module.exports = router;
