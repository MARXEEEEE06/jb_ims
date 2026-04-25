const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) throw err;
  console.log('RemoveProduct connected to MySQL Database');
});

// DELETE /api/removeproduct/:variantId
router.delete('/:variantId', (req, res) => {
  const { variantId } = req.params;

  if (!variantId) {
    return res.status(400).json({ error: 'Variant ID is required' });
  }

  // Step 1: Get product_id before deleting variant
  db.query(
    `SELECT product_id FROM VARIANTS WHERE variant_id = ?`,
    [variantId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (results.length === 0) return res.status(404).json({ error: 'Variant not found' });

      const product_id = results[0].product_id;

      // Step 2: Delete the variant
      db.query(
        `DELETE FROM VARIANTS WHERE variant_id = ?`,
        [variantId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Server error' });

          // Step 3: Check if product has any remaining variants
          db.query(
            `SELECT COUNT(*) AS count FROM VARIANTS WHERE product_id = ?`,
            [product_id],
            (err, countResult) => {
              if (err) return res.status(500).json({ error: 'Server error' });

              const remaining = countResult[0].count;

              // Step 4: If no variants left, delete the product too
              if (remaining === 0) {
                db.query(
                  `DELETE FROM PRODUCTS WHERE product_id = ?`,
                  [product_id],
                  (err) => {
                    if (err) return res.status(500).json({ error: 'Server error' });
                    res.json({ message: 'Variant and orphaned product removed', variantId });
                  }
                );
              } else {
                res.json({ message: 'Variant removed', variantId });
              }
            }
          );
        }
      );
    }
  );
});

module.exports = router;