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
  console.log('EditBrand connected to MySQL Database');
});

router.post('/', (req, res) => {
  const { brand_id, brand_name, description = '' } = req.body;

  if (!brand_id || !brand_name) return res.status(400).json({ error: 'Missing required fields' });

  db.query(
    `UPDATE BRAND SET brand_name = ?, description = ? WHERE brand_id = ?`,
    [brand_name, description, brand_id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json({ message: 'Brand updated' });
    }
  );
});

module.exports = router;