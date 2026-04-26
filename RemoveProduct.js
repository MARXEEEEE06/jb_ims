const express = require('express');
const router = express.Router();
const db = require('./db');

// DELETE /api/removeproduct/:variantId
router.delete('/:variantId', (req, res) => {
  const { variantId } = req.params;

  if (!variantId) return res.status(400).json({ error: 'Variant ID is required' });

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
          // Step 4: Get category_id before deleting product
          db.query(`SELECT category_id FROM PRODUCTS WHERE product_id = ?`, [product_id], (err, prodResult) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            const category_id = prodResult[0]?.category_id;

            // Step 5: Delete supplier_items links ✅
            db.query(`DELETE FROM supplier_items WHERE product_id = ?`, [product_id], (err) => {
              if (err) return res.status(500).json({ error: 'Server error' });

              // Step 6: Delete the product
              db.query(`DELETE FROM PRODUCTS WHERE product_id = ?`, [product_id], (err) => {
                if (err) return res.status(500).json({ error: 'Server error' });

                // Step 7: Check if category is orphaned ✅
                db.query(`SELECT COUNT(*) AS count FROM PRODUCTS WHERE category_id = ?`, [category_id], (err, catCount) => {
                  if (err) return res.status(500).json({ error: 'Server error' });

                  if (catCount[0].count === 0) {
                    db.query(`DELETE FROM CATEGORY WHERE category_id = ?`, [category_id], (err) => {
                      if (err) return res.status(500).json({ error: 'Server error' });
                      res.json({ message: 'Variant, product, supplier link, and orphaned category removed', variantId });
                    });
                  } else {
                    res.json({ message: 'Variant, product, and supplier link removed', variantId });
                  }
                });
              });
            });
          });
        } else {
          res.json({ message: 'Variant removed', variantId });
        }
      });
    });
  });
});

module.exports = router;