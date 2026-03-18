// Example using Node.js, Express, and the 'mysql' package
const express = require('express');
const mysql = require('mys`ql');
const bodyParser = require('body-parser');
const cors = require('cors'); // To handle Cross-Origin Resource Sharing

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection details
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@Lapidmarcdaniel0620',
  database: 'your_database_name'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL Database');
});

// API endpoint to handle form submission
app.post('/submit-form', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send('Name and email are required');
  }

  const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
  db.query(sql, [name, email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error inserting data');
    }
    res.status(200).send('Data inserted successfully');
  });
});

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});