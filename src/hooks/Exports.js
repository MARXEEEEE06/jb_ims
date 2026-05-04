const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./DB.js');
const verifyToken = require('./Auth');
const logActivity = require('./Logger');

// Admin-only middleware
function adminOnly(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}

// POST /api/exports/verify-password
// Re-authenticates the current admin before allowing export
router.post('/verify-password', verifyToken, adminOnly, (req, res) => {
    const { password } = req.body;
    const { user_id, username } = req.user;

    if (!password) return res.status(400).json({ error: 'Password is required.' });

    const sql = `SELECT password FROM login_credentials WHERE user_id = ?`;
    db.query(sql, [user_id], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error.' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found.' });

        const match = await bcrypt.compare(password, results[0].password);

        if (!match) {
            logActivity(user_id, 'EXPORT_AUTH_FAILED', 'user', user_id, { username });
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        logActivity(user_id, 'EXPORT_AUTH_SUCCESS', 'user', user_id, { username });
        res.json({ success: true });
    });
});

// GET /api/exports/logs?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/logs', verifyToken, adminOnly, (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) return res.status(400).json({ error: 'Date range required.' });

    const sql = `
        SELECT
            al.log_id,
            al.action,
            al.target_type,
            al.target_id,
            al.details,
            DATE_FORMAT(al.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
            COALESCE(lc.username, JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.username'))) AS username
        FROM activity_logs al
        LEFT JOIN login_credentials lc ON al.user_id = lc.user_id
        WHERE DATE(al.created_at) BETWEEN ? AND ?
        ORDER BY al.created_at DESC
    `;

    db.query(sql, [from, to], (err, results) => {
        if (err) {
            console.error('Export logs error:', err);
            return res.status(500).json({ error: 'Server error.' });
        }

        logActivity(req.user.user_id, 'EXPORT_LOGS', null, null, {
            from,
            to,
            row_count: results.length,
            username: req.user.username
        });

        res.json(results);
    });
});

// GET /api/exports/receipts?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/receipts', verifyToken, adminOnly, (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) return res.status(400).json({ error: 'Date range required.' });

    // receipt table uses separate `date` column (not datetime)
    const receiptSql = `
        SELECT
            r.receipt_id,
            r.customer_name,
            r.contact_num,
            r.address,
            r.date,
            r.time,
            r.payment_method,
            r.amount_tendered
        FROM receipt r
        WHERE r.date BETWEEN ? AND ?
        ORDER BY r.date DESC, r.time DESC
    `;

    const itemsSql = `
        SELECT
            t.receipt_id,
            t.transaction_id,
            t.unit_price,
            t.quantity,
            (t.unit_price * t.quantity) AS line_total,
            p.product_name,
            v.variant,
            v.sku
        FROM \`transaction\` t
        JOIN variants v ON t.variant_id = v.variant_id
        JOIN products p ON v.product_id = p.product_id
        WHERE t.receipt_id IN (
            SELECT receipt_id FROM receipt WHERE date BETWEEN ? AND ?
        )
    `;

    db.query(receiptSql, [from, to], (err, receipts) => {
        if (err) {
            console.error('Export receipts error:', err);
            return res.status(500).json({ error: 'Server error.' });
        }

        db.query(itemsSql, [from, to], (err2, items) => {
            if (err2) {
                console.error('Export receipt items error:', err2);
                return res.status(500).json({ error: 'Server error.' });
            }

            // Attach items to each receipt and compute totals
            const itemsByReceipt = {};
            items.forEach(item => {
                if (!itemsByReceipt[item.receipt_id]) itemsByReceipt[item.receipt_id] = [];
                itemsByReceipt[item.receipt_id].push(item);
            });

            const enriched = receipts.map(r => {
                const rItems = itemsByReceipt[r.receipt_id] || [];
                const subtotal = rItems.reduce((sum, i) => sum + parseFloat(i.line_total), 0);
                const tax = Math.round(subtotal * 0.10);
                return {
                    ...r,
                    items: rItems,
                    subtotal,
                    tax_amount: tax,
                    grand_total: subtotal + tax,
                    change_amount: parseFloat(r.amount_tendered) - (subtotal + tax)
                };
            });

            logActivity(req.user.user_id, 'EXPORT_RECEIPTS', null, null, {
                from,
                to,
                row_count: receipts.length,
                username: req.user.username
            });

            res.json(enriched);
        });
    });
});

// GET /api/exports/inventory?include=products,suppliers,brands
router.get('/inventory', verifyToken, adminOnly, (req, res) => {
    const include = (req.query.include || 'products,suppliers,brands').split(',');

    const queries = {};

    if (include.includes('products')) {
        queries.products = new Promise((resolve, reject) => {
            const sql = `
                SELECT
                    p.product_id,
                    p.product_name,
                    b.brand_name AS brand,
                    c.category_type AS category,
                    v.sku,
                    v.variant,
                    v.quantity,
                    v.price,
                    si.name AS supplier
                FROM products p
                LEFT JOIN brand b ON p.brand_id = b.brand_id
                LEFT JOIN category c ON p.category_id = c.category_id
                LEFT JOIN variants v ON v.product_id = p.product_id
                LEFT JOIN supplier_items sitem ON sitem.product_id = p.product_id
                LEFT JOIN supplier_info si ON si.sup_info_id = sitem.sup_info_id
                ORDER BY p.product_name
            `;
            db.query(sql, (err, results) => err ? reject(err) : resolve(results));
        });
    }

    if (include.includes('suppliers')) {
        queries.suppliers = new Promise((resolve, reject) => {
            const sql = `
                SELECT sup_info_id, name, contact_num, email, address, status
                FROM supplier_info
                ORDER BY name
            `;
            db.query(sql, (err, results) => err ? reject(err) : resolve(results));
        });
    }

    if (include.includes('brands')) {
        queries.brands = new Promise((resolve, reject) => {
            const sql = `
                SELECT brand_id, brand_name, description, status
                FROM brand
                ORDER BY brand_name
            `;
            db.query(sql, (err, results) => err ? reject(err) : resolve(results));
        });
    }

    Promise.all(Object.entries(queries).map(([key, p]) => p.then(data => [key, data])))
        .then(resolved => {
            const result = Object.fromEntries(resolved);

            logActivity(req.user.user_id, 'EXPORT_INVENTORY', null, null, {
                include,
                username: req.user.username
            });

            res.json(result);
        })
        .catch(err => {
            console.error('Export inventory error:', err);
            res.status(500).json({ error: 'Server error.' });
        });
});

module.exports = router;
