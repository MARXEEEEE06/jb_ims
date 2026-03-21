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
  console.log('Login connected to MySQL Database');
});

router.post('/', (req, res) => {
  const { username, password } = req.body;

  // if (!username || !password) {
  //   return res.status(400).send('Username and password are required');
  // }

    const sql = `
    SELECT lc.username, ui.role_id
    FROM login_credentials lc
    JOIN user_info ui ON lc.user_info_id = ui.user_info_id
    WHERE lc.username = ? AND lc.password = ?
    `;
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('SQL Error: ', err);
      return res.status(500).json({ error: 'Server error' });
    }

    console.log('Query Results:', results); // 👈 log everything

    if (results.length > 0) {
      // Login successful
      const user = results[0];
      console.log('User Found:', results[0]); // 👈 log first row
      res.json({ username: user.username, role: user.password });
    } else {
      // Login failed
      res.status(401).json({ error: 'Username or password invalid. Try again.' });
    }
  });
});

module.exports = router;