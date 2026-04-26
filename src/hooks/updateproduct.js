const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

function generateSKU(product_name, brand_name, variant) {
  const p = product_name.substring(0, 3).toUpperCase();
  const b = brand_name.substring(0, 3).toUpperCase();
  const v = variant.substring(0, 2).toUpperCase();
  return `${p}${b}${V}-${Date.now().toString().slice(-4)}`;
}

router.post('/', (req, res) => {
  const {
    variant_id,
    product_id,
    product_name,
    brand_id,
    category_type,
    variant,
    price,
    quantity,
    unit_type,
  } = req.body;

  const userId = req.user?.user_id ?? null;

  if (!variant_id || !product_id || !product_name || !brand_id || !category_type || !variant || !price || !unit_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Fetch before-state for logging
  db.query(
    `SELECT p.product_name, b.brand_name, c.category_type, v.variant, v.price, v.quantity, u.unit_type
     FROM VARIANTS v
     JOIN PRODUCTS p ON v.product_id = p.product_id
     JOIN BRAND b ON p.brand_id = b.brand_id
     JOIN CATEGORY c ON p.category_id = c.category_id
     JOIN UNIT u ON v.unit_id = u.unit_id
     WHERE v.variant_id = ?`,
    [variant_id],
    (err, beforeRows) => {
      const before = beforeRows?.[0] ?? {};

      db.query(`SELECT brand_name FROM BRAND WHERE brand_id = ?`, [brand_id], (err, brandResults) => {
        if (err) return res.status(500).json({ error: 'Brand Server error' });
        if (brandResults.length === 0) return res.status(400).json({ error: 'Brand not found' });

        const brand_name = brandResults[0].brand_name;

        db.query(`SELECT category_id FROM CATEGORY WHERE category_type = ?`, [category_type], (err, catResults) => {
          if (err) return res.status(500).json({ error: 'Server error' });

          const updateProduct = (category_id) => {
            db.query(
              `UPDATE PRODUCTS SET product_name = ?, brand_id = ?, category_id = ? WHERE product_id = ?`,
              [product_name, brand_id, category_id, product_id],
              (err) => {
                if (err) return res.status(500).json({ error: 'Server error' });

                db.query(`SELECT unit_id FROM UNIT WHERE unit_type = ?`, [unit_type], (err, unitResults) => {
                  if (err) return res.status(500).json({ error: 'Server error' });

                  const updateVariant = (unit_id) => {
                    const sku = generateSKU(product_name, brand_name, variant);

                    db.query(
                      `UPDATE VARIANTS SET unit_id = ?, sku = ?, quantity = ?, price = ?, variant = ? WHERE variant_id = ?`,
                      [unit_id, sku, Number(quantity), Number(price), variant, variant_id],
                      (err) => {
                        if (err) return res.status(500).json({ error: 'Server error' });

                        db.query(
                          `SELECT p.product_id, p.product_name, b.brand_name AS brand, b.brand_id,
                                  c.category_type, c.category_id,
                                  v.variant_id, v.sku, v.variant, v.price, v.quantity,
                                  u.unit_type, u.unit_id,
                                  si.name AS supplier
                          FROM PRODUCTS p
                          LEFT JOIN BRAND b ON p.brand_id = b.brand_id
                          LEFT JOIN CATEGORY c ON p.category_id = c.category_id
                          LEFT JOIN VARIANTS v ON v.product_id = p.product_id
                          LEFT JOIN UNIT u ON v.unit_id = u.unit_id
                          LEFT JOIN supplier_items sim ON p.product_id = sim.product_id
                          LEFT JOIN supplier_info si ON sim.sup_info_id = si.sup_info_id
                          WHERE v.variant_id = ?`,
                          [variant_id],
                          (err, rows) => {
                            if (err) return res.status(500).json({ error: 'Server error' });

                            logActivity(userId, 'PRODUCT_UPDATE', 'product', product_id, {
                              variant_id,
                              before: {
                                product_name: before.product_name,
                                brand: before.brand_name,
                                category: before.category_type,
                                variant: before.variant,
                                price: before.price,
                                quantity: before.quantity,
                                unit: before.unit_type,
                              },
                              after: {
                                product_name,
                                brand: brand_name,
                                category: category_type,
                                variant,
                                price: Number(price),
                                quantity: Number(quantity),
                                unit: unit_type,
                              },
                            });

                            res.json({ message: 'Product updated', sku, product: rows[0] });
                          }
                        );
                      }
                    );
                  };

                  if (unitResults.length > 0) {
                    updateVariant(unitResults[0].unit_id);
                  } else {
                    db.query(`INSERT INTO UNIT (unit_type) VALUES (?)`, [unit_type], (err, unitResult) => {
                      if (err) return res.status(500).json({ error: 'Server error' });
                      updateVariant(unitResult.insertId);
                    });
                  }
                });
              }
            );
          };

          if (catResults.length > 0) {
            updateProduct(catResults[0].category_id);
          } else {
            db.query(`INSERT INTO CATEGORY (category_type) VALUES (?)`, [category_type], (err, catResult) => {
              if (err) return res.status(500).json({ error: 'Server error' });
              updateProduct(catResult.insertId);
            });
          }
        });
      });
    }
  );
});

module.exports = router;
