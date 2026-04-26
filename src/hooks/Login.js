const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const jwt  = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('./config')

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
const db = require('./db');

router.post('/', (req, res) => {
  const { username, password } = req.body;

    const sql = `
    SELECT 
      lc.username,
      ui.user_id,
      ui.role_id,
      r.role_type  -- ← was r.role
    FROM login_credentials lc
    JOIN user_info ui ON lc.user_id = ui.user_id
    JOIN role r ON ui.role_id = r.role_id
    WHERE lc.username = ? AND lc.password = ?
    `;
    db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('SQL Error: ', err);
      return res.status(500).json({ error: 'Backend Server error' });
    }

    console.log('Query Results:', results); // 👈 log everything

    if (results.length > 0) {
     // Login successful
      const user = results[0];
      const payload = {
        user_id: user.user_id,
        username: user.username,
        role: user.role_type,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      console.log('User Found:', user);
      console.log('Role:', user.role);
      res.json({ username: user.username, role: user.role_type, token });
    } else {
      res.status(401).json({ error: 'Username or password invalid. Try again.' });
    }
  });
});

module.exports = router;