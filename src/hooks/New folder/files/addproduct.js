const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

function generateSKU(product_name, brand_name, variant) {
  const p = product_name.substring(0, 3).toUpperCase();
  const b = brand_name.substring(0, 3).toUpperCase();
  const v = variant.substring(0, 2).toUpperCase();
  return `${p}${b}${v}-${Date.now().toString().slice(-4)}`;
}

router.post('/', (req, res) => {
  const {
    product_name,
    brand_id,
    category,
    variant,
    price,
    unit_type,
    quantity = 0,
    supplier,
  } = req.body;

  const userId = req.user?.user_id ?? null;

  if (!product_name || !brand_id || !category || !variant || !price || !unit_type || !supplier) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(`SELECT brand_name FROM BRAND WHERE brand_id = ?`, [brand_id], (err, brandResults) => {
    if (err) return res.status(500).json({ error: 'Brand Server error' });
    if (brandResults.length === 0) return res.status(400).json({ error: 'Brand not found' });

    const brand_name = brandResults[0].brand_name;

    db.query(`SELECT category_id FROM CATEGORY WHERE category_type = ?`, [category], (err, catResults) => {
      if (err) return res.status(500).json({ error: 'Category Server error' });

      const insertProduct = (category_id) => {
        db.query(
          `INSERT INTO PRODUCTS (product_name, brand_id, category_id) VALUES (?, ?, ?)`,
          [product_name, brand_id, category_id],
          (err, prodResult) => {
            if (err) return res.status(500).json({ error: 'Insert Server error' });

            const product_id = prodResult.insertId;

            db.query(`SELECT unit_id FROM UNIT WHERE unit_type = ?`, [unit_type], (err, unitResults) => {
              if (err) return res.status(500).json({ error: 'Unit Server error' });

              const insertVariant = (unit_id) => {
                const sku = generateSKU(product_name, brand_name, variant);

                db.query(
                  `INSERT INTO VARIANTS (product_id, unit_id, sku, quantity, price, variant) VALUES (?, ?, ?, ?, ?, ?)`,
                  [product_id, unit_id, sku, Number(quantity), Number(price), variant],
                  (err, varResult) => {
                    if (err) return res.status(500).json({ error: 'Variant Server error' });

                    db.query(`SELECT sup_info_id FROM supplier_info WHERE name = ?`, [supplier], (err, supResults) => {
                      if (err) return res.status(500).json({ error: 'Supplier Server error' });

                      const linkSupplier = (sup_info_id) => {
                        db.query(
                          `INSERT INTO supplier_items (sup_info_id, product_id) VALUES (?, ?)`,
                          [sup_info_id, product_id],
                          (err) => {
                            if (err) return res.status(500).json({ error: 'Supplier link error' });

                            logActivity(userId, 'PRODUCT_CREATED', 'product', product_id, {
                              product_name,
                              brand: brand_name,
                              category,
                              variant,
                              sku,
                              price: Number(price),
                              quantity: Number(quantity),
                              supplier,
                            });

                            res.json({ message: 'Product added', sku, variant_id: varResult.insertId });
                          }
                        );
                      };

                      if (supResults.length > 0) {
                        linkSupplier(supResults[0].sup_info_id);
                      } else {
                        db.query(
                          `INSERT INTO supplier_info (name, status) VALUES (?, 'active')`,
                          [supplier],
                          (err, supResult) => {
                            if (err) return res.status(500).json({ error: 'Supplier insert error' });
                            linkSupplier(supResult.insertId);
                          }
                        );
                      }
                    });
                  }
                );
              };

              if (unitResults.length > 0) {
                insertVariant(unitResults[0].unit_id);
              } else {
                db.query(`INSERT INTO UNIT (unit_type) VALUES (?)`, [unit_type], (err, unitResult) => {
                  if (err) return res.status(500).json({ error: 'Unit Insert Server error' });
                  insertVariant(unitResult.insertId);
                });
              }
            });
          }
        );
      };

      if (catResults.length > 0) {
        insertProduct(catResults[0].category_id);
      } else {
        db.query(`INSERT INTO CATEGORY (category_type) VALUES (?)`, [category], (err, catResult) => {
          if (err) return res.status(500).json({ error: 'Category Insert Server error' });
          insertProduct(catResult.insertId);
        });
      }
    });
  });
});

module.exports = router;
