import React, { useState } from "react";
import jsPDF from "jspdf";
import ExportPasswordModal from "../modals/ExportPasswordModal.jsx";
import BASE_URL from "../../../hooks/server/config.js";
import getAuthHeaders from "../../../hooks/server/getAuthHeaders.js";
import "./ExportsTab.css";

// ─── helpers ────────────────────────────────────────────────────────────────

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function toCSV(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const lines = [
        headers.join(","),
        ...rows.map(row =>
            headers.map(h => {
                const val = row[h] ?? "";
                const str = typeof val === "object" ? JSON.stringify(val) : String(val);
                return `"${str.replace(/"/g, '""')}"`;
            }).join(",")
        )
    ];
    return lines.join("\n");
}

// ─── PDF generators ──────────────────────────────────────────────────────────

function exportLogsPDF(data, from, to) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40, right = 555, center = 297;
    let y = 40;

    const checkPage = (space = 20) => {
        if (y + space > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            y = 40;
        }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("J.B.SERRANO — Activity Logs", center, y, { align: "center" }); y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Period: ${from} to ${to}`, center, y, { align: "center" }); y += 10;
    doc.text(`Total records: ${data.length}`, center, y, { align: "center" }); y += 14;
    doc.line(left, y, right, y); y += 12;

    // Column headers
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("DATE", left, y);
    doc.text("USER", left + 120, y);
    doc.text("ACTION", left + 200, y);
    doc.text("TARGET", left + 310, y);
    doc.text("DETAILS", left + 390, y);
    y += 8;
    doc.line(left, y, right, y); y += 10;

    doc.setFont("helvetica", "normal");
    data.forEach(log => {
        checkPage(14);
        const details = typeof log.details === "object"
            ? JSON.stringify(log.details).substring(0, 40)
            : String(log.details || "").substring(0, 40);
        doc.text(log.created_at?.substring(0, 16) || "", left, y);
        doc.text(log.username || "—", left + 120, y);
        doc.text(log.action || "", left + 200, y);
        doc.text(`${log.target_type || ""} #${log.target_id || ""}`, left + 310, y);
        doc.text(details, left + 390, y);
        y += 14;
    });

    doc.save(`logs_${from}_to_${to}.pdf`);
}

function exportReceiptsPDF(data, from, to) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40, right = 555, center = 297;
    let y = 40;

    const checkPage = (space = 20) => {
        if (y + space > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            y = 40;
        }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("J.B.SERRANO — Receipts", center, y, { align: "center" }); y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Period: ${from} to ${to}`, center, y, { align: "center" }); y += 10;
    doc.text(`Total receipts: ${data.length}`, center, y, { align: "center" }); y += 14;
    doc.line(left, y, right, y); y += 12;

    data.forEach(receipt => {
        const itemCount = receipt.items?.length || 0;
        checkPage(80 + itemCount * 14);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Receipt #${receipt.receipt_id}`, left, y);
        doc.text(`${receipt.date}`, right, y, { align: "right" }); y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Customer: ${receipt.customer_name}`, left, y); y += 12;
        doc.text(`Address: ${receipt.customer_address || "—"}`, left, y);
        doc.text(`Contact: ${receipt.customer_contact || "—"}`, right, y, { align: "right" }); y += 12;
        doc.text(`Payment: ${receipt.payment_method?.toUpperCase()}`, left, y); y += 10;

        // Items
        doc.setFont("helvetica", "bold");
        doc.text("PRODUCT", left, y);
        doc.text("VARIANT", left + 180, y);
        doc.text("QTY", left + 300, y);
        doc.text("PRICE", left + 360, y);
        doc.text("TOTAL", left + 430, y);
        y += 8;
        doc.line(left, y, right, y); y += 10;

        doc.setFont("helvetica", "normal");
        (receipt.items || []).forEach(item => {
            doc.text(item.product_name || "", left, y);
            doc.text(item.variant || "", left + 180, y);
            doc.text(String(item.quantity), left + 300, y);
            doc.text(`P${item.unit_price}`, left + 360, y);
            doc.text(`P${item.line_total}`, left + 430, y);
            y += 13;
        });

        doc.line(left, y, right, y); y += 10;
        doc.text(`Subtotal: P${receipt.subtotal}`, right, y, { align: "right" }); y += 12;
        doc.text(`Tax (10%): P${receipt.tax_amount}`, right, y, { align: "right" }); y += 12;
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: P${receipt.grand_total}`, right, y, { align: "right" }); y += 12;
        doc.setFont("helvetica", "normal");
        doc.text(`Tendered: P${receipt.amount_tendered}  Change: P${Math.max(0, receipt.change_amount)}`, right, y, { align: "right" });
        y += 20;
        doc.line(left, y, right, y); y += 20;
    });

    doc.save(`receipts_${from}_to_${to}.pdf`);
}

function exportInventoryPDF(data) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 40, right = 555, center = 297;
    let y = 40;

    const checkPage = (space = 20) => {
        if (y + space > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            y = 40;
        }
    };

    const section = (title) => {
        checkPage(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(title, left, y); y += 14;
        doc.line(left, y, right, y); y += 12;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("J.B.SERRANO — Inventory Export", center, y, { align: "center" }); y += 30;

    if (data.products?.length) {
        section("Products");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("PRODUCT", left, y);
        doc.text("BRAND", left + 130, y);
        doc.text("SKU", left + 220, y);
        doc.text("VARIANT", left + 330, y);
        doc.text("QTY", left + 410, y);
        doc.text("PRICE", left + 450, y);
        y += 8;
        doc.line(left, y, right, y); y += 10;
        doc.setFont("helvetica", "normal");
        data.products.forEach(p => {
            checkPage(13);
            doc.text(p.product_name || "", left, y);
            doc.text(p.brand || "—", left + 130, y);
            doc.text(p.sku || "", left + 220, y);
            doc.text(p.variant || "", left + 330, y);
            doc.text(String(p.quantity ?? ""), left + 410, y);
            doc.text(`P${p.price}`, left + 450, y);
            y += 13;
        });
        y += 10;
    }

    if (data.suppliers?.length) {
        section("Suppliers");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("SUPPLIER", left, y);
        doc.text("CONTACT", left + 200, y);
        doc.text("EMAIL", left + 300, y);
        doc.text("STATUS", left + 450, y);
        y += 8;
        doc.line(left, y, right, y); y += 10;
        doc.setFont("helvetica", "normal");
        data.suppliers.forEach(s => {
            checkPage(13);
            doc.text(s.supplier_name || "", left, y);
            doc.text(s.contact_num || "", left + 200, y);
            doc.text(s.email || "", left + 300, y);
            doc.text(s.status || "", left + 450, y);
            y += 13;
        });
        y += 10;
    }

    if (data.brands?.length) {
        section("Brands");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("BRAND", left, y);
        doc.text("DESCRIPTION", left + 180, y);
        doc.text("STATUS", left + 450, y);
        y += 8;
        doc.line(left, y, right, y); y += 10;
        doc.setFont("helvetica", "normal");
        data.brands.forEach(b => {
            checkPage(13);
            doc.text(b.brand_name || "", left, y);
            doc.text(b.description || "—", left + 180, y);
            doc.text(b.status || "", left + 450, y);
            y += 13;
        });
    }

    doc.save(`inventory_export.pdf`);
}

// ─── format dispatcher ───────────────────────────────────────────────────────

function generateExport(type, format, data, from, to) {
    if (type === "logs") {
        if (format === "csv") {
            const blob = new Blob([toCSV(data)], { type: "text/csv" });
            downloadBlob(blob, `logs_${from}_to_${to}.csv`);
        } else if (format === "json") {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            downloadBlob(blob, `logs_${from}_to_${to}.json`);
        } else {
            exportLogsPDF(data, from, to);
        }
    } else if (type === "receipts") {
        if (format === "csv") {
            // Flatten receipts for CSV
            const flat = data.flatMap(r =>
                (r.items || [{}]).map(item => ({
                    receipt_id: r.receipt_id,
                    date: r.date,
                    customer: r.customer_name,
                    address: r.customer_address,
                    contact: r.customer_contact,
                    payment_method: r.payment_method,
                    product: item.product_name || "",
                    variant: item.variant || "",
                    qty: item.quantity || "",
                    unit_price: item.unit_price || "",
                    line_total: item.line_total || "",
                    subtotal: r.subtotal,
                    tax: r.tax_amount,
                    grand_total: r.grand_total,
                    amount_tendered: r.amount_tendered,
                    change: r.change_amount
                }))
            );
            const blob = new Blob([toCSV(flat)], { type: "text/csv" });
            downloadBlob(blob, `receipts_${from}_to_${to}.csv`);
        } else if (format === "json") {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            downloadBlob(blob, `receipts_${from}_to_${to}.json`);
        } else {
            exportReceiptsPDF(data, from, to);
        }
    } else if (type === "inventory") {
        if (format === "csv") {
            let csv = "";
            if (data.products?.length) csv += "=== PRODUCTS ===\n" + toCSV(data.products) + "\n\n";
            if (data.suppliers?.length) csv += "=== SUPPLIERS ===\n" + toCSV(data.suppliers) + "\n\n";
            if (data.brands?.length) csv += "=== BRANDS ===\n" + toCSV(data.brands);
            const blob = new Blob([csv], { type: "text/csv" });
            downloadBlob(blob, `inventory_export.csv`);
        } else if (format === "json") {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            downloadBlob(blob, `inventory_export.json`);
        } else {
            exportInventoryPDF(data);
        }
    }
}

// ─── component ───────────────────────────────────────────────────────────────

function ExportsTab() {
    const today = new Date().toISOString().split("T")[0];

    const [logs, setLogs] = useState({ from: today, to: today, format: "csv" });
    const [receipts, setReceipts] = useState({ from: today, to: today, format: "csv" });
    const [inventory, setInventory] = useState({
        include: { products: true, suppliers: true, brands: true },
        format: "csv"
    });

    // Modal state: null | { type: 'logs'|'receipts'|'inventory' }
    const [modal, setModal] = useState(null);
    const [modalError, setModalError] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    // Validation errors per section
    const [errors, setErrors] = useState({});

    const validate = (type) => {
        if (type === "logs") {
            if (!logs.from || !logs.to) return "Both dates are required.";
            if (logs.from > logs.to) return "Start date must be before end date.";
        }
        if (type === "receipts") {
            if (!receipts.from || !receipts.to) return "Both dates are required.";
            if (receipts.from > receipts.to) return "Start date must be before end date.";
        }
        if (type === "inventory") {
            const { products, suppliers, brands } = inventory.include;
            if (!products && !suppliers && !brands) return "Select at least one category.";
        }
        return null;
    };

    const openModal = (type) => {
        const err = validate(type);
        if (err) {
            setErrors(prev => ({ ...prev, [type]: err }));
            return;
        }
        setErrors(prev => ({ ...prev, [type]: "" }));
        setModalError("");
        setModal({ type });
    };

    const handleExport = async (password) => {
        setModalLoading(true);
        setModalError("");

        // Step 1: verify password
        try {
            const verifyRes = await fetch(`${BASE_URL}/exports/verify-password`, {
                method: "POST",
                headers: getAuthHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ password })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                setModalError(verifyData.error || "Incorrect password.");
                setModalLoading(false);
                return;
            }
        } catch {
            setModalError("Server error. Try again.");
            setModalLoading(false);
            return;
        }

        // Step 2: fetch export data
        const type = modal.type;
        let url = "";
        if (type === "logs") url = `${BASE_URL}/exports/logs?from=${logs.from}&to=${logs.to}`;
        if (type === "receipts") url = `${BASE_URL}/exports/receipts?from=${receipts.from}&to=${receipts.to}`;
        if (type === "inventory") {
            const inc = Object.keys(inventory.include).filter(k => inventory.include[k]).join(",");
            url = `${BASE_URL}/exports/inventory?include=${inc}`;
        }

        try {
            const res = await fetch(url, {
                headers: getAuthHeaders({ "Content-Type": "application/json" })
            });
            const data = await res.json();
            if (!res.ok) {
                setModalError(data.error || "Export failed.");
                setModalLoading(false);
                return;
            }

            const format = type === "logs" ? logs.format
                : type === "receipts" ? receipts.format
                : inventory.format;

            generateExport(
                type,
                format,
                data,
                type === "logs" ? logs.from : receipts.from,
                type === "logs" ? logs.to : receipts.to
            );

            setModal(null);
        } catch {
            setModalError("Server error. Try again.");
        }

        setModalLoading(false);
    };

    return (
        <div className="container exports-container">
            <h1>Exports</h1>

            {/* ── Logs ───────────────────────────────────────────── */}
            <div className="export-wrapper">
                <h2>Activity Logs</h2>
                <p className="export-desc">Export all system activity logs within a date range.</p>
                <div className="export-controls">
                    <div className="export-field">
                        <label>From</label>
                        <input
                            type="date"
                            value={logs.from}
                            max={today}
                            onChange={e => {
                                setLogs(p => ({ ...p, from: e.target.value }));
                                setErrors(p => ({ ...p, logs: "" }));
                            }}
                        />
                    </div>
                    <div className="export-field">
                        <label>To</label>
                        <input
                            type="date"
                            value={logs.to}
                            max={today}
                            onChange={e => {
                                setLogs(p => ({ ...p, to: e.target.value }));
                                setErrors(p => ({ ...p, logs: "" }));
                            }}
                        />
                    </div>
                    <div className="export-field">
                        <label>Format</label>
                        <select value={logs.format} onChange={e => setLogs(p => ({ ...p, format: e.target.value }))}>
                            <option value="csv">CSV</option>
                            <option value="pdf">PDF</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    <button className="export-btn" onClick={() => openModal("logs")}>Export</button>
                </div>
                {errors.logs && <span className="error-msg">{errors.logs}</span>}
            </div>

            {/* ── Receipts ───────────────────────────────────────── */}
            <div className="export-wrapper">
                <h2>Receipts</h2>
                <p className="export-desc">Export receipts with full line-item breakdown within a date range.</p>
                <div className="export-controls">
                    <div className="export-field">
                        <label>From</label>
                        <input
                            type="date"
                            value={receipts.from}
                            max={today}
                            onChange={e => {
                                setReceipts(p => ({ ...p, from: e.target.value }));
                                setErrors(p => ({ ...p, receipts: "" }));
                            }}
                        />
                    </div>
                    <div className="export-field">
                        <label>To</label>
                        <input
                            type="date"
                            value={receipts.to}
                            max={today}
                            onChange={e => {
                                setReceipts(p => ({ ...p, to: e.target.value }));
                                setErrors(p => ({ ...p, receipts: "" }));
                            }}
                        />
                    </div>
                    <div className="export-field">
                        <label>Format</label>
                        <select value={receipts.format} onChange={e => setReceipts(p => ({ ...p, format: e.target.value }))}>
                            <option value="csv">CSV</option>
                            <option value="pdf">PDF</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    <button className="export-btn" onClick={() => openModal("receipts")}>Export</button>
                </div>
                {errors.receipts && <span className="error-msg">{errors.receipts}</span>}
            </div>

            {/* ── Inventory ──────────────────────────────────────── */}
            <div className="export-wrapper">
                <h2>Inventory</h2>
                <p className="export-desc">Export a snapshot of current inventory data.</p>
                <div className="export-controls">
                    <div className="export-checkboxes">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={inventory.include.products}
                                onChange={e => {
                                    setInventory(p => ({ ...p, include: { ...p.include, products: e.target.checked } }));
                                    setErrors(p => ({ ...p, inventory: "" }));
                                }}
                            /> Products
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={inventory.include.suppliers}
                                onChange={e => {
                                    setInventory(p => ({ ...p, include: { ...p.include, suppliers: e.target.checked } }));
                                    setErrors(p => ({ ...p, inventory: "" }));
                                }}
                            /> Suppliers
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={inventory.include.brands}
                                onChange={e => {
                                    setInventory(p => ({ ...p, include: { ...p.include, brands: e.target.checked } }));
                                    setErrors(p => ({ ...p, inventory: "" }));
                                }}
                            /> Brands
                        </label>
                    </div>
                    <div className="export-field">
                        <label>Format</label>
                        <select value={inventory.format} onChange={e => setInventory(p => ({ ...p, format: e.target.value }))}>
                            <option value="csv">CSV</option>
                            <option value="pdf">PDF</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    <button className="export-btn" onClick={() => openModal("inventory")}>Export</button>
                </div>
                {errors.inventory && <span className="error-msg">{errors.inventory}</span>}
            </div>

            {/* ── Password Modal ─────────────────────────────────── */}
            {modal && (
                <ExportPasswordModal
                    onConfirm={handleExport}
                    onCancel={() => { setModal(null); setModalError(""); }}
                    isLoading={modalLoading}
                    error={modalError}
                />
            )}
        </div>
    );
}

export default ExportsTab;
