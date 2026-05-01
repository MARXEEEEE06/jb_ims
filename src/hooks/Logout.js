const express = require('express');
const router = express.Router();
const logActivity = require('./Logger.js');

router.post('/', (req, res) => {
  logActivity(req.user?.user_id, 'LOGOUT', null, null, {});
  res.json({ message: 'Logged out' });
});

module.exports = router;