const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection details
const db = mysql.createConnection({
  host: 'localhost',
  user: 'marx',
  password: '12345678',
  database: 'ims_db',
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Inventory connected to MySQL Database');
});

function getStatus(stock) {
  if (stock === 0) return 'OUT OF STOCK';
  if (stock < 10) return 'CRITICAL';
  if (stock < 20) return 'LOW';
  return 'IN-STOCK';
}

router.post('/', (req, res) => {
  const sql = `SELECT * FROM prod_dtls`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error: ', err);
      return res.status(500).json({ error: 'Server error' });
    }

    console.log('Query Results:', results);

    if (results.length > 0) {
      const items = results.map(item => ({
        ...item,
        status: getStatus(item.stock_quantity)
      }));

      res.json(items);
    } else {
      res.status(404).json({ error: 'Item not found.' });
    }
  });
});

module.exports = router;