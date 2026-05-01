const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');  // add this
const db = require('./DB');
const logActivity = require('./Logger');

const app = express();
app.use(cors());
app.use(bodyParser.json());

router.post('/', (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT 
      lc.username,
      lc.password,
      ui.user_id,
      ui.role_id,
      r.role_type
    FROM login_credentials lc
    JOIN user_info ui ON lc.user_id = ui.user_id
    JOIN role r ON ui.role_id = r.role_id
    WHERE BINARY lc.username = ?
  `;


  db.query(sql, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Backend Server error' });

    if (results.length === 0) {
        logActivity(null, 'FAILED_LOGIN', 'user', null, { username, reason: 'Invalid credentials' });
        return res.status(401).json({ error: 'Username or password invalid. Try again.' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        logActivity(null, 'FAILED_LOGIN', 'user', null, { username, reason: 'Invalid credentials' });
        return res.status(401).json({ error: 'Username or password invalid. Try again.' });
    }

    const payload = { user_id: user.user_id, username: user.username, role: user.role_type };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    logActivity(user.user_id, 'LOGIN', 'user', user.user_id, { username: user.username });
    res.json({ username: user.username, role: user.role_type, token });
});
});

module.exports = router;
