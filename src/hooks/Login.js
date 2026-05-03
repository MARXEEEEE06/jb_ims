const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./DB');
const logActivity = require('./Logger');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

router.post('/', (req, res) => {
    const { username, password } = req.body;

    // Check lockout
    const lockoutSql = `
        SELECT COUNT(*) AS attempts
        FROM login_attempts
        WHERE username = ?
          AND attempted_at > DATE_SUB(NOW(), INTERVAL ${LOCKOUT_MINUTES} MINUTE)
    `;

    db.query(lockoutSql, [username], (err, lockoutRows) => {
        if (err) return res.status(500).json({ error: 'Server error' });

        const attempts = lockoutRows[0].attempts;
        if (attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({
                error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`
            });
        }

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
            if (err) return res.status(500).json({ error: 'Server error' });

            const recordFailure = () => {
                db.query(
                    `INSERT INTO login_attempts (username) VALUES (?)`,
                    [username]
                );
                logActivity(null, 'FAILED_LOGIN', 'user', null, { username, reason: 'Invalid credentials' });
            };

            if (results.length === 0) {
                recordFailure();
                const remaining = MAX_ATTEMPTS - (attempts + 1);
                return res.status(401).json({
                    error: remaining > 0
                        ? `Username or password invalid. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
                        : `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`
                });
            }

            const user = results[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                recordFailure();
                const remaining = MAX_ATTEMPTS - (attempts + 1);
                return res.status(401).json({
                    error: remaining > 0
                        ? `Username or password invalid. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
                        : `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`
                });
            }

            // Success — clear attempts
            db.query(`DELETE FROM login_attempts WHERE username = ?`, [username]);

            const payload = { user_id: user.user_id, username: user.username, role: user.role_type };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            logActivity(user.user_id, 'LOGIN', 'user', user.user_id, { username: user.username });
            res.json({ username: user.username, role: user.role_type, token });
        });
    });
});

module.exports = router;