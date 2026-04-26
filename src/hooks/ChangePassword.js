const express = require("express");
const router = express.Router();

const db = require("./db");
const verifyToken = require("./Auth");
const logActivity = require("./logger");

router.post("/", verifyToken, (req, res) => {
  const userId = req.user.user_id;

  const {
    currentPassword,
    newPassword,
    confirmPassword
  } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      error: "All fields are required."
    });
  }

  if (newPassword !== confirmPassword) {
    logActivity(userId, "PASSWORD_CHANGE_FAILED", "user", userId, {
      reason: "Passwords do not match"
    });

    return res.status(400).json({
      error: "New passwords do not match."
    });
  }

  const strongPassword =
    /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

  if (!strongPassword.test(newPassword)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and contain number + symbol."
    });
  }

  const checkSql = `
    SELECT * FROM login_credentials
    WHERE user_id = ? AND password = ?
  `;

  db.query(checkSql, [userId, currentPassword], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Server error."
      });
    }

    if (results.length === 0) {
      logActivity(userId, "PASSWORD_CHANGE_FAILED", "user", userId, {
        reason: "Wrong current password"
      });

      return res.status(401).json({
        error: "Current password is incorrect."
      });
    }

    const updateSql = `
      UPDATE login_credentials
      SET password = ?
      WHERE user_id = ?
    `;

    db.query(updateSql, [newPassword, userId], (err2) => {
      if (err2) {
        return res.status(500).json({
          error: "Failed to update password."
        });
      }

      logActivity(userId, "PASSWORD_CHANGED", "user", userId, {
        changedBy: userId
      });

      res.json({
        message: "Password changed successfully."
      });
    });
  });
});

module.exports = router;