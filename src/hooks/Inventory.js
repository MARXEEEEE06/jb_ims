// Example using Node.js, Express, and the 'mysql' package
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // To handle Cross-Origin Resource Sharing
const port = 5001;

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
  console.log('Connected to MySQL Database');
});

app.post('/api/inventory', (req, res) => {
  const sql = `SELECT * FROM prod_dtls`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('SQL Error: ', err);
      return res.status(500).json({ error: 'Server error' });
    }

    console.log('Query Results:', results);

    if (results.length > 0) {
      res.json( results );
    } else {
      res.status(404).json({ error: 'Item not found.' });
    }
  });
});

app.listen(port, () => {
  console.log('Backend server running on port ' + port);
});