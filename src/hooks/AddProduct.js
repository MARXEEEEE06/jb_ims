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
  console.log('AddProduct connected to MySQL Database');
});

function generateSKU(product_name, brand, variant) {
  const p = product_name.substring(0, 3).toUpperCase();
  const b = brand.substring(0, 3).toUpperCase();
  const v = variant.substring(0, 2).toUpperCase();
  return `${p}${b}${v}-${Date.now().toString().slice(-4)}`;
}

// POST /api/add-product
router.post('/', (req, res) => {
  const {
    product_name,
    brand,
    category_type,
    variant,
    price,
    quantity = 0,
    unit_type,
  } = req.body;

  if (!product_name || !brand || !category_type || !variant || !price || !unit_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Step 1: Get or insert category
  db.query(
    `SELECT category_id FROM CATEGORY WHERE category_type = ?`,
    [category_type],
    (err, catResults) => {
      if (err) return res.status(500).json({ error: 'Server error' });

      const insertProduct = (category_id) => {
        // Step 2: Insert into PRODUCTS
        db.query(
          `INSERT INTO PRODUCTS (product_name, brand, category_id) VALUES (?, ?, ?)`,
          [product_name, brand, category_id],
          (err, prodResult) => {
            if (err) return res.status(500).json({ error: 'Server error' });

            const product_id = prodResult.insertId;

            // Step 3: Get or insert unit
            db.query(
              `SELECT unit_id FROM UNIT WHERE unit_type = ?`,
              [unit_type],
              (err, unitResults) => {
                if (err) return res.status(500).json({ error: 'Server error' });

                const insertVariant = (unit_id) => {
                  const sku = generateSKU(product_name, brand, variant);

                  // Step 4: Insert into VARIANTS
                  db.query(
                    `INSERT INTO VARIANTS (product_id, unit_id, sku, quantity, price, variant) VALUES (?, ?, ?, ?, ?, ?)`,
                    [product_id, unit_id, sku, Number(quantity), Number(price), variant],
                    (err, varResult) => {
                      if (err) {
                        console.error('SQL Error:', err);
                        return res.status(500).json({ error: 'Server error' });
                      }
                      res.json({ message: 'Product added', sku, variant_id: varResult.insertId });
                    }
                  );
                };

                if (unitResults.length > 0) {
                  insertVariant(unitResults[0].unit_id);
                } else {
                  db.query(
                    `INSERT INTO UNIT (unit_type) VALUES (?)`,
                    [unit_type],
                    (err, unitResult) => {
                      if (err) return res.status(500).json({ error: 'Server error' });
                      insertVariant(unitResult.insertId);
                    }
                  );
                }
              }
            );
          }
        );
      };

      if (catResults.length > 0) {
        insertProduct(catResults[0].category_id);
      } else {
        db.query(
          `INSERT INTO CATEGORY (category_type) VALUES (?)`,
          [category_type],
          (err, catResult) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            insertProduct(catResult.insertId);
          }
        );
      }
    }
  );
});

module.exports = router;