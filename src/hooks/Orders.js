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
  console.log('Orders connected to MySQL Database');
});

// POST /api/orders — create receipt + transaction items
router.post('/', (req, res) => {
  const {
    login_id,
    customer_name,
    customer_address,
    customer_contact,
    payment_method,
    amount_tendered,
    items, // [{ product_id, quantity, price }]
  } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ error: 'No items in order' });

  if (!customer_name || !payment_method || !amount_tendered)
    return res.status(400).json({ error: 'Missing required fields' });

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];

  // Step 1: Insert RECEIPT
  db.query(
    `INSERT INTO RECEIPT (customer_name, contact_num, address, date, time, payment_method, amount_tendered)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [customer_name, customer_contact, customer_address, date, time, payment_method, amount_tendered],
    (err, receiptResult) => {
      if (err) {
        console.error('Receipt insert error:', err);
        return res.status(500).json({ error: 'Failed to create receipt' });
      }

      const receipt_id = receiptResult.insertId;

      // Step 2: Get variant_id from product_id for each item
      const variantLookups = items.map(i => new Promise((resolve, reject) => {
        db.query(
          `SELECT variant_id FROM VARIANTS WHERE product_id = ? LIMIT 1`,
          [i.product_id],
          (err, rows) => {
            if (err || rows.length === 0) return reject(`No variant for product_id ${i.product_id}`);
            resolve({ variant_id: rows[0].variant_id, unit_price: i.price, quantity: i.quantity });
          }
        );
      }));

      Promise.all(variantLookups)
        .then(resolvedItems => {
          // Step 3: Insert TRANSACTION rows
          const transactionValues = resolvedItems.map(i => [
            receipt_id, i.variant_id, Number(i.unit_price), Number(i.quantity)
          ]);

          db.query(
            `INSERT INTO TRANSACTION (receipt_id, variant_id, unit_price, quantity) VALUES ?`,
            [transactionValues],
            (err) => {
              if (err) {
                console.error('Transaction insert error:', err);
                return res.status(500).json({ error: 'Failed to insert transaction items' });
              }

              // Step 4: Deduct stock
              resolvedItems.forEach(i => {
                db.query(
                  `UPDATE VARIANTS SET quantity = GREATEST(0, quantity - ?) WHERE variant_id = ?`,
                  [i.quantity, i.variant_id],
                  (err) => { if (err) console.error('Stock deduct error:', err); }
                );
              });

              res.json({
                message: 'Order created',
                receipt_id,
                customer_name,
                customer_address,
                customer_contact,
                payment_method,
                amount_tendered,
                date,
                time,
                items,
              });
            }
          );
        })
        .catch(err => {
          console.error('Variant lookup error:', err);
          res.status(500).json({ error: 'Variant lookup failed' });
        });
    }
  );
});

// GET /api/orders — get all receipts
router.get('/', (req, res) => {
  const sql = `
    SELECT * FROM RECEIPT
    ORDER BY date DESC, time DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// GET /api/orders/:id — get receipt with its transaction items
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      r.receipt_id,
      r.customer_name,
      r.contact_num,
      r.address,
      r.date,
      r.time,
      r.payment_method,
      t.transaction_id,
      t.variant_id,
      t.unit_price,
      t.quantity,
      v.variant,
      v.sku,
      p.product_name,
      u.unit_type
    FROM RECEIPT r
    LEFT JOIN TRANSACTION t ON r.receipt_id = t.receipt_id
    LEFT JOIN VARIANTS v ON t.variant_id = v.variant_id
    LEFT JOIN PRODUCTS p ON v.product_id = p.product_id
    LEFT JOIN UNIT u ON v.unit_id = u.unit_id
    WHERE r.receipt_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(results);
  });
});

module.exports = router;