const express = require('express');
const router = express.Router();
const db = require('./DB.js');
const logActivity = require('./Logger');
const verifyToken = require('./Auth');

// GET /api/suppliers
router.get('/', verifyToken, (req, res) => {
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
router.post('/', verifyToken, (req, res) => {
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

      console.log("User FOUND:", userId);

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
router.post('/status/:sup_info_id', verifyToken, (req, res) => {
  const { sup_info_id } = req.params;
  const { status } = req.body;
  const userId = req.user?.user_id ?? null;

  // Fetch before-state, then toggle (default) or set explicit status
  db.query(`SELECT name, status FROM supplier_info WHERE sup_info_id = ?`, [sup_info_id], (err, beforeRows) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    const before = beforeRows?.[0];
    if (!before) return res.status(404).json({ error: 'Supplier not found' });

    const hasExplicitStatus = status !== undefined && status !== null && String(status).trim() !== '';
    const nextDbStatus = hasExplicitStatus
      ? String(status).toLowerCase()
      : (before.status === 'active' ? 'inactive' : 'active');

    db.query(
      `UPDATE supplier_info SET status = ? WHERE sup_info_id = ?`,
      [nextDbStatus, sup_info_id],
      (uErr) => {
        if (uErr) {
          console.error('SQL Error:', uErr);
          return res.status(500).json({ error: 'Server error' });
        }

        logActivity(userId, 'SUPPLIER_UPDATE', 'supplier', Number(sup_info_id), {
          name: before.name,
          field: 'status',
          before: before.status,
          after: nextDbStatus,
        });

        res.json({
          message: `Status updated to ${nextDbStatus}`,
          status: nextDbStatus === 'active' ? 'Active' : 'Inactive',
        });
      }
    );
  });
});

module.exports = router;
