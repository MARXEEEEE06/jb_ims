const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('./db');
const logActivity = require('./logger');

const app = express();
app.use(cors());
app.use(bodyParser.json());

router.post('/', (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT 
      lc.username,
      ui.user_id,
      ui.role_id,
      r.role_type
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

    console.log('Query Results:', results);

    if (results.length > 0) {
      const user = results[0];
      const payload = {
        user_id: user.user_id,
        username: user.username,
        role: user.role_type,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      logActivity(user.user_id, 'LOGIN', 'user', user.user_id, { username: user.username });

      console.log('User Found:', user);
      console.log('Role:', user.role);
      res.json({ username: user.username, role: user.role_type, token });
    } else {
      // Failed login — no user_id available
      logActivity(null, 'FAILED_LOGIN', 'user', null, { username, reason: 'Invalid credentials' });
      res.status(401).json({ error: 'Username or password invalid. Try again.' });
    }
  });
});

module.exports = router;
