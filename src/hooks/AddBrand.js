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
  console.log('AddBrand connected to MySQL Database');
});

router.post('/', (req, res) => {
  const { brand_name, description = '' } = req.body;

  if (!brand_name) return res.status(400).json({ error: 'Brand name is required' });

  db.query(
    `INSERT INTO BRAND (brand_name, description) VALUES (?, ?)`,
    [brand_name, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json({ message: 'Brand added', brand_id: result.insertId });
    }
  );
});

module.exports = router;