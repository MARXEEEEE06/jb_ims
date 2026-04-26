const express = require('express');
const router = express.Router();
const db = require('./db');

function formatDateOnly(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthRange(monthParam) {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    return { start, end };
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

// GET /api/supply-demand/monthly?month=YYYY-MM
router.get('/monthly', (req, res) => {
  const { start, end } = getMonthRange(req.query.month);
  const startDate = formatDateOnly(start);
  const endDate = formatDateOnly(end);

  const supplySql = `
    SELECT
      p.product_id,
      p.product_name AS product,
      SUM(x.supply) AS supply
    FROM (
      SELECT
        al.target_id AS product_id,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.quantity')) AS UNSIGNED) AS supply
      FROM activity_logs al
      WHERE al.action = 'PRODUCT_CREATED'
        AND al.created_at >= ? AND al.created_at < ?

      UNION ALL

      SELECT
        v.product_id AS product_id,
        GREATEST(CAST(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.adjustment')) AS SIGNED), 0) AS supply
      FROM activity_logs al
      JOIN variants v ON v.variant_id = al.target_id
      WHERE al.action = 'STOCK_UPDATE'
        AND al.created_at >= ? AND al.created_at < ?
    ) x
    JOIN products p ON p.product_id = x.product_id
    GROUP BY p.product_id, p.product_name
  `;

  const demandSql = `
    SELECT
      p.product_id,
      p.product_name AS product,
      SUM(t.quantity) AS demand
    FROM transaction t
    JOIN receipt r ON r.receipt_id = t.receipt_id
    JOIN variants v ON v.variant_id = t.variant_id
    JOIN products p ON p.product_id = v.product_id
    WHERE r.date >= ? AND r.date < ?
    GROUP BY p.product_id, p.product_name
  `;

  db.query(supplySql, [startDate, endDate, startDate, endDate], (sErr, supplyRows) => {
    if (sErr) {
      console.error('SQL Error (supply-demand supply):', sErr);
      return res.status(500).json({ error: 'Server error' });
    }

    db.query(demandSql, [startDate, endDate], (dErr, demandRows) => {
      if (dErr) {
        console.error('SQL Error (supply-demand demand):', dErr);
        return res.status(500).json({ error: 'Server error' });
      }

      const byId = new Map();
      for (const r of supplyRows || []) {
        byId.set(r.product_id, { product: r.product, supply: Number(r.supply || 0), demand: 0 });
      }
      for (const r of demandRows || []) {
        const existing = byId.get(r.product_id);
        if (existing) {
          existing.demand = Number(r.demand || 0);
        } else {
          byId.set(r.product_id, { product: r.product, supply: 0, demand: Number(r.demand || 0) });
        }
      }

      const data = Array.from(byId.values())
        .filter(r => (r.supply || 0) > 0 || (r.demand || 0) > 0)
        .sort((a, b) => (b.supply + b.demand) - (a.supply + a.demand))
        .slice(0, 10);

      res.json({
        range: { start: startDate, end: endDate },
        data,
      });
    });
  });
});

module.exports = router;

