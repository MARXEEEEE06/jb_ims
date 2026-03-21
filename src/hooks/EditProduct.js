const express = require('express');
const mysql = require('mysql');

const router = express.Router();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'marx',
  password: '12345678',
  database: 'ims_db',
});

db.connect(err => {
  if (err) throw err;
  console.log('EditProducts connected to MySQL Database');
});

// SKU generator
function generateSKU(prod_name, brand, variety, supplier) {
  const p = prod_name.substring(0,3).toUpperCase();
  const b = brand.substring(0,3).toUpperCase();
  const v = variety.substring(0,2).toUpperCase();
  const s = supplier.substring(0,3).toUpperCase();
  return `${p}${b}${v}-${s}`;
}

router.post('/', (req, res) => {
    const {
        product_id,
        prod_name = 'Null',
        price = 0,
        stock_quantity = 0,
        brand = 'Null',
        variety = 'Null',
        supplier = 'Null',
        category = 'Null',
        unit_type = 'Null',
    } = req.body;

    if (!prod_name || !brand || !variety || !supplier || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sku = generateSKU(prod_name, brand, variety, supplier);

    // const sql = `
    // INSERT INTO prod_dtls (
    //   prod_name,
    //   price,
    //   stock_quantity,
    //   SKU,
    //   brand,
    //   variety,
    //   supplier,
    //   category,
    //   unit_type
    // )
    // VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `;

    const sql = `
      UPDATE prod_dtls
      SET 
        prod_name = ?,
        price = ?,
        stock_quantity = ?,
        SKU = ?,
        brand = ?,
        variety = ?,
        supplier = ?,
        category = ?,
        unit_type = ?
      WHERE product_id = ?
    `;

    db.query(
      sql,
      [
        prod_name || 'Null',
        Number(price) || 0,
        Number(stock_quantity) || 0,
        sku || 'Null',
        brand || 'Null',
        variety || 'Null',
        supplier || 'Null',
        category || 'Null',
        unit_type || 'Null',
        product_id // <-- this is new
      ],
      (err, results) => {
        if (err) {
          console.error('SQL Error: ', err);
          return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Product editted', SKU: sku, id: results.insertId });
      }
    );
});

module.exports = router;