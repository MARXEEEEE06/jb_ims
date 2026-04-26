const express = require('express');
const router = express.Router();
const db = require('./db');
const logActivity = require('./logger');

router.post('/', (req, res) => {
  const {
    username,
    password,
    email = '',
    contact_num = '',
    role_id = 2,
  } = req.body;

  const actorId = req.user?.user_id ?? null;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.query(
    `INSERT INTO user_info (email, contact_num, role_id) VALUES (?, ?, ?)`,
    [email, contact_num, role_id],
    (err, result) => {
      if (err) {
        console.error('SQL Error (user_info):', err);
        return res.status(500).json({ error: 'Server error inserting user info' });
      }

      const user_id = result.insertId;

      db.query(
        `INSERT INTO login_credentials (user_id, username, password) VALUES (?, ?, ?)`,
        [user_id, username, password],
        (err, loginResult) => {
          if (err) {
            console.error('SQL Error (login_credentials):', err);
            return res.status(500).json({ error: 'Server error inserting login credentials' });
          }

          logActivity(actorId, 'USER_ADDED', 'user', user_id, {
            username,
            email,
            contact_num,
            role_id,
          });

          res.json({
            message: 'User added successfully',
            user_id,
            login_id: loginResult.insertId,
          });
        }
      );
    }
  );
});

module.exports = router;
