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
  console.log('Supplier routes connected to MySQL Database');
});

// GET all suppliers with total_products count
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      si.supplier_info_id AS supplier_id,
      si.Name AS supplier_name,
      si.contact_num AS contact_no,
      si.email,
      si.address,
      si.status,
      COUNT(sit.supplier_items_id) AS total_products
    FROM supplier_info si
    LEFT JOIN supplier_items sit ON si.supplier_info_id = sit.supplier_info_id
    GROUP BY si.supplier_info_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'API Server error' });
    }

    // Capitalize status for frontend consistency
    const mapped = results.map(row => ({
      ...row,
      status: row.status === 'active' ? 'Active' : 'Inactive'
    }));

    res.json(mapped);
  });
});

// POST add new supplier
router.post('/', (req, res) => {
  const {
    supplier_name,
    contact_no,
    email,
    address,
  } = req.body;

  if (!supplier_name || !contact_no || !email || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO supplier_info (Name, contact_num, email, address, status)
    VALUES (?, ?, ?, ?, 'active')
  `;

  db.query(sql, [supplier_name, contact_no, email, address], (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      // Handle unique constraint violations
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Contact number or email already exists' });
      }
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ message: 'Supplier added', id: results.insertId });
  });
});

// POST edit supplier status (toggle)
router.post('/:supplier_id', (req, res) => {
  const { supplier_id } = req.params;
  const { status } = req.body; // expects 'Active' or 'Inactive' from frontend

  if (!status) {
    return res.status(400).json({ error: 'Missing status' });
  }

  const dbStatus = status.toLowerCase(); // convert to 'active' or 'inactive' for ENUM

  const sql = `
    UPDATE supplier_info SET status = ? WHERE supplier_info_id = ?
  `;

  db.query(sql, [dbStatus, supplier_id], (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: `Supplier status updated to ${status}` });
  });
});

module.exports = router;
