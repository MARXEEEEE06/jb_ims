const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

// GET /api/suppliers
router.get('/', (req, res) => {
  const sql = `
    SELECT
      si.sup_info_id,
      si.name,
      si.contact_num,
      si.email,
      si.address,
      si.status,
      COUNT(sit.sup_items_id) AS total_products
    FROM supplier_info si
    LEFT JOIN supplier_items sit ON si.sup_info_id = sit.sup_info_id
    GROUP BY si.sup_info_id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    const mapped = results.map(row => ({
      ...row,
      status: row.status === 'active' ? 'Active' : 'Inactive',
    }));
    res.json(mapped);
  });
});

// POST /api/suppliers — add new supplier
router.post('/', (req, res) => {
  const { name, contact_num, email, address } = req.body;
  const userId = req.user?.user_id ?? null;

  if (!name || !contact_num || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query(
    `INSERT INTO supplier_info (name, contact_num, email, address, status) VALUES (?, ?, ?, ?, 'active')`,
    [name, contact_num, email, address],
    (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Contact number or email already exists' });
        }
        return res.status(500).json({ error: 'Server error' });
      }

      logActivity(userId, 'SUPPLIER_ADDED', 'supplier', results.insertId, {
        name,
        contact_num,
        email,
        address,
      });

      res.json({ message: 'Supplier added', sup_info_id: results.insertId });
    }
  );
});

// POST /api/suppliers/status/:sup_info_id — toggle status
router.post('/status/:sup_info_id', (req, res) => {
  const { sup_info_id } = req.params;
  const { status } = req.body;
  const userId = req.user?.user_id ?? null;

  if (!status) return res.status(400).json({ error: 'Missing status' });

  // Fetch before-state for logging
  db.query(`SELECT name, status FROM supplier_info WHERE sup_info_id = ?`, [sup_info_id], (err, beforeRows) => {
    const before = beforeRows?.[0] ?? {};
    const dbStatus = status.toLowerCase();

    db.query(
      `UPDATE supplier_info SET status = ? WHERE sup_info_id = ?`,
      [dbStatus, sup_info_id],
      (err, results) => {
        if (err) {
          console.error('SQL Error:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Supplier not found' });
        }

        logActivity(userId, 'SUPPLIER_UPDATE', 'supplier', Number(sup_info_id), {
          name: before.name,
          field: 'status',
          before: before.status,
          after: dbStatus,
        });

        res.json({ message: `Status updated to ${status}` });
      }
    );
  });
});

module.exports = router;
