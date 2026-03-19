// Example using Node.js, Express, and the 'mysql' package
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors'); // To handle Cross-Origin Resource Sharing
const port = 5000;

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

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // if (!username || !password) {
  //   return res.status(400).send('Username and password are required');
  // }

    const sql = 'SELECT * FROM login_credentials WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('SQL Error: ', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length > 0) {
      // Login successful
      const user = results[0];
      res.json({ username: user.username, role: user.password });
    } else {
      // Login failed
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.listen(port, () => {
  console.log('Backend server running on port ' + port);
});