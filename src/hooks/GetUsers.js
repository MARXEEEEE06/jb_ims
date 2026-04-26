const express = require("express");
const router = express.Router();
const db = require('./db');
const verifyToken = require("./Auth");
const logActivity = require("./logger");

function requireAdmin(req, res, next) {
  const role = String(req.user?.role ?? "").toLowerCase();
  if (role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET all users
router.get("/", verifyToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT 
      lc.login_id,
      lc.username,
      ui.user_id,
      ui.email,
      ui.contact_num,
      r.role_type
    FROM login_credentials lc
    JOIN user_info ui ON lc.user_id = ui.user_id
    JOIN role r ON ui.role_id = r.role_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    res.json(results);
  });
});

// PUT /api/getusers/:userId - update user details (admin only)
router.put("/:userId", verifyToken, requireAdmin, (req, res) => {
  const actorId = req.user?.user_id ?? null;
  const userId = Number(req.params.userId);

  const {
    username,
    email = "",
    contact_num = "",
    role_id,
  } = req.body;

  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  if (!username || !String(username).trim()) {
    return res.status(400).json({ error: "Username is required." });
  }

  const parsedRoleId = Number(role_id);
  if (![1, 2].includes(parsedRoleId)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  db.beginTransaction((txErr) => {
    if (txErr) {
      console.error("TX Error:", txErr);
      return res.status(500).json({ error: "Server error" });
    }

    db.query(
      `UPDATE user_info SET email = ?, contact_num = ?, role_id = ? WHERE user_id = ?`,
      [String(email), String(contact_num), parsedRoleId, userId],
      (uErr, uRes) => {
        if (uErr) {
          return db.rollback(() => {
            console.error("SQL Error (user_info update):", uErr);
            res.status(500).json({ error: "Server error" });
          });
        }

        db.query(
          `UPDATE login_credentials SET username = ? WHERE user_id = ?`,
          [String(username).trim(), userId],
          (lErr, lRes) => {
            if (lErr) {
              return db.rollback(() => {
                console.error("SQL Error (login_credentials update):", lErr);
                res.status(500).json({ error: "Server error" });
              });
            }

            if ((uRes?.affectedRows ?? 0) === 0 || (lRes?.affectedRows ?? 0) === 0) {
              return db.rollback(() => {
                res.status(404).json({ error: "User not found." });
              });
            }

            db.commit((cErr) => {
              if (cErr) {
                return db.rollback(() => {
                  console.error("TX Commit Error:", cErr);
                  res.status(500).json({ error: "Server error" });
                });
              }

              logActivity(actorId, "USER_UPDATED", "user", userId, {
                username: String(username).trim(),
                email: String(email),
                contact_num: String(contact_num),
                role_id: parsedRoleId,
              });

              res.json({ message: "User updated successfully." });
            });
          }
        );
      }
    );
  });
});

module.exports = router;
