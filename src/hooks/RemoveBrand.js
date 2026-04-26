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
  console.log('RemoveBrand connected to MySQL Database');
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // ON DELETE SET NULL handles the products side
  db.query(`DELETE FROM BRAND WHERE brand_id = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json({ message: 'Brand removed' });
  });
});

module.exports = router;