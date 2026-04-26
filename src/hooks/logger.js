const db = require('./db');

/**
 * Fire-and-forget activity logger.
 * Never throws — logging failures are silent so they don't break routes.
 *
 * @param {number|null} userId     - req.user?.user_id
 * @param {string}      action     - e.g. 'LOGIN', 'STOCK_UPDATE'
 * @param {string|null} targetType - e.g. 'variant', 'product', 'supplier'
 * @param {number|null} targetId   - the affected row's PK
 * @param {object}      details    - arbitrary JSON (before/after values, etc.)
 */
function logActivity(userId = null, action, targetType = null, targetId = null, details = {}) {
  const sql = `
    INSERT INTO activity_logs (user_id, action, target_type, target_id, details)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [userId, action, targetType, targetId, JSON.stringify(details)], (err) => {
    if (err) console.error('[logger] Failed to write activity log:', err.message);
  });
}

module.exports = logActivity;
