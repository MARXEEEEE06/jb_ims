const express = require("express");
const router = express.Router();
const db = require("./DB");
const bcrypt = require('bcrypt');
const verifyToken = require("./Auth");
const logActivity = require("./Logger");

function requireAdmin(req, res, next) {
  const role = String(req.user?.role ?? "").toLowerCase();
  if (role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}

// POST /api/changepassword — change own password
router.post("/", verifyToken, (req, res) => {
  const userId = req.user.user_id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ error: "All fields are required." });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ error: "New passwords do not match." });

  const strongPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!strongPassword.test(newPassword))
    return res.status(400).json({ error: "Password must be at least 8 characters with 1 number and 1 symbol." });

  db.query(`SELECT password FROM login_credentials WHERE user_id = ?`, [userId], async (err, results) => {
    if (err) return res.status(500).json({ error: "Server error." });
    if (results.length === 0) return res.status(401).json({ error: "User not found." });

    const match = await bcrypt.compare(currentPassword, results[0].password);
    if (!match) {
      logActivity(userId, "PASSWORD_CHANGE_FAILED", "user", userId, { reason: "Wrong current password" });
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    db.query(`UPDATE login_credentials SET password = ? WHERE user_id = ?`, [hashedNew, userId], (err2) => {
      if (err2) return res.status(500).json({ error: "Failed to update password." });
      logActivity(userId, "PASSWORD_CHANGED", "user", userId, { changedBy: userId });
      res.json({ message: "Password changed successfully." });
    });
  });
});

// POST /api/changepassword/admin — admin changes another user's password
router.post('/admin', verifyToken, requireAdmin, async (req, res) => {
  const actorId = req.user.user_id;
  const { targetUserId, adminPassword, newPassword, confirmPassword } = req.body;

  if (!targetUserId || !adminPassword || !newPassword || !confirmPassword)
    return res.status(400).json({ error: 'All fields are required.' });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ error: 'New passwords do not match.' });

  const strongPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!strongPassword.test(newPassword))
    return res.status(400).json({ error: 'Password must be at least 8 characters with 1 number and 1 symbol.' });

  try {
    const [adminRows] = await db.promise().query(
      `SELECT password FROM login_credentials WHERE user_id = ?`, [actorId]
    );
    if (!adminRows.length) return res.status(401).json({ error: 'Admin not found.' });

    const adminMatch = await bcrypt.compare(adminPassword, adminRows[0].password);
    if (!adminMatch) return res.status(401).json({ error: 'Admin password is incorrect.' });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.promise().query(
      `UPDATE login_credentials SET password = ? WHERE user_id = ?`, [hashedNew, targetUserId]
    );

    logActivity(actorId, 'PASSWORD_CHANGED', 'user', targetUserId, { changedBy: actorId });
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;