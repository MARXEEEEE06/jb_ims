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
  console.log('EditProduct connected to MySQL Database');
});

function generateSKU(product_name, brand, variant) {
  const p = product_name.substring(0, 3).toUpperCase();
  const b = brand.substring(0, 3).toUpperCase();
  const v = variant.substring(0, 2).toUpperCase();
  return `${p}${b}${v}-${Date.now().toString().slice(-4)}`;
}

// POST /api/edit-product
router.post('/', (req, res) => {
  const {
    variant_id,
    product_id,
    product_name,
    brand,
    category_type,
    variant,
    price,
    quantity,
    unit_type,
  } = req.body;

  if (!variant_id || !product_id || !product_name || !brand || !category_type || !variant || !price || !unit_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Step 1: Get or insert category
  db.query(
    `SELECT category_id FROM CATEGORY WHERE category_type = ?`,
    [category_type],
    (err, catResults) => {
      if (err) return res.status(500).json({ error: 'Server error' });

      const updateProduct = (category_id) => {
        // Step 2: Update PRODUCTS
        db.query(
          `UPDATE PRODUCTS SET product_name = ?, brand = ?, category_id = ? WHERE product_id = ?`,
          [product_name, brand, category_id, product_id],
          (err) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            // Step 3: Get or insert unit
            db.query(
              `SELECT unit_id FROM UNIT WHERE unit_type = ?`,
              [unit_type],
              (err, unitResults) => {
                if (err) return res.status(500).json({ error: 'Server error' });

                const updateVariant = (unit_id) => {
                  const sku = generateSKU(product_name, brand, variant);

                  // Step 4: Update VARIANTS
                  db.query(
                    `UPDATE VARIANTS SET unit_id = ?, sku = ?, quantity = ?, price = ?, variant = ? WHERE variant_id = ?`,
                    [unit_id, sku, Number(quantity), Number(price), variant, variant_id],
                    (err) => {
                      if (err) {
                        console.error('SQL Error:', err);
                        return res.status(500).json({ error: 'Server error' });
                      }

                      // Fetch updated full product to return
                      db.query(
                        `SELECT p.product_id, p.product_name, p.brand,
                                c.category_type, c.category_id,
                                v.variant_id, v.sku, v.variant, v.price, v.quantity,
                                u.unit_type, u.unit_id,
                                si.name AS supplier
                        FROM PRODUCTS p
                        LEFT JOIN CATEGORY c ON p.category_id = c.category_id
                        LEFT JOIN VARIANTS v ON v.product_id = p.product_id
                        LEFT JOIN UNIT u ON v.unit_id = u.unit_id
                        LEFT JOIN supplier_items sim ON p.product_id = sim.product_id
                        LEFT JOIN supplier_info si ON sim.sup_info_id = si.sup_info_id
                        WHERE v.variant_id = ?`,
                        [variant_id],
                        (err, rows) => {
                          if (err) return res.status(500).json({ error: 'Server error' });
                          res.json({ message: 'Product updated', sku, product: rows[0] });
                        }
                      );
                    }
                  );
                };

                if (unitResults.length > 0) {
                  updateVariant(unitResults[0].unit_id);
                } else {
                  db.query(
                    `INSERT INTO UNIT (unit_type) VALUES (?)`,
                    [unit_type],
                    (err, unitResult) => {
                      if (err) return res.status(500).json({ error: 'Server error' });
                      updateVariant(unitResult.insertId);
                    }
                  );
                }
              }
            );
          }
        );
      };

      if (catResults.length > 0) {
        updateProduct(catResults[0].category_id);
      } else {
        db.query(
          `INSERT INTO CATEGORY (category_type) VALUES (?)`,
          [category_type],
          (err, catResult) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            updateProduct(catResult.insertId);
          }
        );
      }
    }
  );
});

module.exports = router;