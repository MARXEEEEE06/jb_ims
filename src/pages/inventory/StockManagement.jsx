import { useState, useEffect } from "react";
import BASE_URL from "../../hooks/server/config";
import getStatusClass from "../../hooks/inventory/GetStatus";
import getAuthHeaders from "../../hooks/server/getAuthHeaders.js";
import HeaderOveriew from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import "./StockManagement.css";

import Toast from "../../components/features/modals/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import { useKeywordFilter } from '../../hooks/filters/useKeywordFilter';
import { useBrandFilter } from '../../hooks/filters/useBrandFilter';
import { useSupplierFilter } from '../../hooks/filters/useSupplierFilter';
import { useStatusFilter } from '../../hooks/filters/useStatusFilter';
import { useSort } from '../../hooks/filters/useSort';

function StockManagement() {
const [items, setItems] = useState([]);
const [activeItem, setActiveItem] = useState(null);
const [adjustment, setAdjustment] = useState(0);
const [isSaving, setIsSaving] = useState(false);
const [error, setError] = useState("");
const [adjustType, setAdjustType] = useState('RESTOCK');
const [confirmStep, setConfirmStep] = useState(false);
const {toast, showToast, clearToast} = useToast();

// Filter/sort chain
const { filtered: keywordFiltered, keyword, setKeyword } = useKeywordFilter(items);
const { filtered: brandFiltered, brand, setBrand, brands } = useBrandFilter(keywordFiltered, items);
const { filtered: supplierFiltered, supplier, setSupplier, suppliers } = useSupplierFilter(brandFiltered, items);
const { filtered: statusFiltered, status, setStatus } = useStatusFilter(supplierFiltered, 'quantity');
const { sorted: finalFiltered, sortKey, setSortKey, order, setOrder } = useSort(statusFiltered);

const fetchInventory = async () => {
    try {
        const response = await fetch(`${BASE_URL}/inventory`, {
            method: "POST",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({}),
        });
        const data = await response.json();
        if (response.ok) {
            setItems(Array.isArray(data) ? data : [data]);
        } else {
            showToast(data.error);
        }
    } catch (e) {
        alert("Server Error");
    }
};

useEffect(() => {
    fetchInventory();
}, []);

const openModal = (item) => {
    setActiveItem(item);
    setAdjustment(0);
    setError("");
    setAdjustType('RESTOCK');
    setConfirmStep(false);
};

// Update closeModal
const closeModal = () => {
    setActiveItem(null);
    setAdjustment(0);
    setError("");
    setIsSaving(false);
    setAdjustType('RESTOCK');
    setConfirmStep(false);
};

const handleStockChange = async (variantId, delta) => {
    if (!delta || Number.isNaN(Number(delta))) {
        setError("Please enter a valid adjustment.");
        return;
    }
    try {
        setIsSaving(true);
        setError("");
        const response = await fetch(`${BASE_URL}/stock/${variantId}`, {
            method: "PATCH",
            headers: { ...getAuthHeaders({ "Content-Type": "application/json" }) },
            body: JSON.stringify({ adjustment: Number(delta), type: adjustType }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            await fetchInventory();
            closeModal();
        } else {
            setError(data.error || "Failed to update stock.");
            setConfirmStep(false);
        }
    } catch {
        setError("Server error");
        setConfirmStep(false);
    } finally {
        setIsSaving(false);
    }
};

getStatusClass();

return (
    <div className="main-container">
        <HeaderOveriew
            items={items}
            field="product_name"
            keyword={keyword}
            setKeyword={setKeyword}
        />
        <Sidebar />
        <div className="container stocks-container">
            <div className="filters-panel">
                <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                    <option value="">All Brands</option>
                    {brands.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>

                <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                    <option value="">All Suppliers</option>
                    {suppliers.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="critical">Critical</option>
                    <option value="out-of-stock">Out of Stock</option>
                </select>
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                    <option value="">Sort by...</option>
                    <option value="product_name">Alphabetical</option>
                    <option value="quantity">Stock</option>
                    <option value="status">Status</option>
                </select>
                <select value={order} onChange={(e) => setOrder(e.target.value)}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>

            <p className="results-count">{finalFiltered.length} result{finalFiltered.length !== 1 ? 's' : ''}</p>

            <table>
                <thead>
                    <tr>
                        <th>ITEMS</th>
                        <th>TYPE</th>
                        <th>QUANTITY</th>
                        <th>UNIT TYPE</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {finalFiltered.map((item) => {
                        return (
                            <tr key={item.variant_id}>
                                <td>{item.product_name}</td>
                                <td>{item.variant}</td>
                                <td className="qty-adjust">
                                    {item.quantity}
                                    <button
                                        type="button"
                                        className="stock-adjust-btn"
                                        onClick={() => openModal(item)}
                                    >
                                        Adjust
                                    </button>
                                </td>
                                <td>{item.unit_type}</td>
                                <td>
                                    <div className={`status-container ${getStatusClass(item.quantity)}`}>
                                        {item.status}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {activeItem && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content stock-modal" onClick={(e) => e.stopPropagation()}>

                        {!confirmStep ? (
                            <>
                                <h2>Adjust Stock</h2>
                                <div className="stock-modal-meta">
                                    <div><strong>Item:</strong> {activeItem.product_name}</div>
                                    <div><strong>Variant:</strong> {activeItem.variant}</div>
                                    <div><strong>Current Qty:</strong> {activeItem.quantity}</div>
                                </div>

                                <label className="stock-modal-label">Adjustment Type</label>
                                <div className="stock-type-toggle">
                                    <button
                                        type="button"
                                        className={adjustType === 'RESTOCK' ? 'active' : ''}
                                        onClick={() => { setAdjustType('RESTOCK'); setAdjustment(0); }}
                                    >
                                        Restock
                                    </button>
                                    <button
                                        type="button"
                                        className={adjustType === 'CORRECTION' ? 'active' : ''}
                                        onClick={() => { setAdjustType('CORRECTION'); setAdjustment(0); }}
                                    >
                                        Correction
                                    </button>
                                </div>

                                <label className="stock-modal-label" htmlFor="stock-adjustment">
                                    Adjustment ({adjustType === 'RESTOCK' ? '+' : '+/-'})
                                </label>
                                <input
                                    id="stock-adjustment"
                                    type="number"
                                    step="1"
                                    className="stock-adjustment-input"
                                    value={adjustment}
                                    min={adjustType === 'RESTOCK' ? 1 : undefined}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw === "") { setAdjustment(""); return; }
                                        const next = Number(raw);
                                        if (Number.isNaN(next)) return;
                                        setAdjustment(adjustType === 'RESTOCK' ? Math.max(1, next) : next);
                                    }}
                                    onKeyDown={(e) => {
                                        if (adjustType === 'RESTOCK' && (e.key === "-" || e.key === "Subtract")) {
                                            e.preventDefault();
                                        }
                                        if (e.key === "Enter" && Number(adjustment)) {
                                            e.preventDefault();
                                            setConfirmStep(true);
                                        }
                                    }}
                                />

                                <div className="stock-macro-row">
                                    {adjustType === 'CORRECTION' && (
                                        <>
                                            <button type="button" onClick={() => setAdjustment(p => Number(p || 0) - 10)}>-10</button>
                                            <button type="button" onClick={() => setAdjustment(p => Number(p || 0) - 5)}>-5</button>
                                            <button type="button" onClick={() => setAdjustment(p => Number(p || 0) - 1)}>-1</button>
                                        </>
                                    )}
                                    <button type="button" onClick={() => setAdjustment(p => Number(p || 0) + 1)}>+1</button>
                                    <button type="button" onClick={() => setAdjustment(p => Number(p || 0) + 5)}>+5</button>
                                    <button type="button" onClick={() => setAdjustment(p => Number(p || 0) + 10)}>+10</button>
                                </div>

                                <div className="stock-modal-preview">
                                    <strong>New Qty Preview:</strong>{" "}
                                    {Math.max(0, Number(activeItem.quantity) + Number(adjustment || 0))}
                                </div>

                                {error && <div className="stock-modal-error" role="alert">{error}</div>}

                                <button
                                    type="button"
                                    className="confirm-btn"
                                    onClick={() => setConfirmStep(true)}
                                    disabled={!Number(adjustment) || (adjustType === 'RESTOCK' && Number(adjustment) <= 0)}
                                >
                                    Next
                                </button>
                                <button type="button" className="cancel-btn" onClick={closeModal} disabled={isSaving}>
                                    Back
                                </button>
                            </>
                        ) : (
                            <>
                                <h2>Confirm Adjustment</h2>
                                <div className="stock-modal-meta">
                                    <div><strong>Item:</strong> {activeItem.product_name}</div>
                                    <div><strong>Variant:</strong> {activeItem.variant}</div>
                                </div>

                                <div className={`stock-confirm-type ${
                                    adjustType === 'CORRECTION' ? 'correction'
                                    : Number(adjustment) > 0 ? 'restock'
                                    : 'sold'
                                }`}>
                                    {adjustType === 'CORRECTION'
                                        ? 'CORRECTION'
                                        : Number(adjustment) > 0 ? 'RESTOCK' : 'SOLD'
                                    }
                                </div>

                                <div className="stock-confirm-row">
                                    <div><span>Before</span><strong>{activeItem.quantity}</strong></div>
                                    <div><span>Adjustment</span><strong>{Number(adjustment) > 0 ? `+${adjustment}` : adjustment}</strong></div>
                                    <div><span>After</span><strong>{Math.max(0, Number(activeItem.quantity) + Number(adjustment))}</strong></div>
                                </div>

                                {error && <div className="stock-modal-error" role="alert">{error}</div>}

                                <div className="stock-modal-actions">
                                    <button
                                        type="button"
                                        className="confirm-btn"
                                        onClick={() => handleStockChange(activeItem.variant_id, adjustment)}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "Saving..." : "Confirm"}
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => setConfirmStep(false)} disabled={isSaving}>
                                        Back
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
        {toast && (
            <Toast
                key={toast.key}
                message={toast.message}
                duration={toast.duration}
                onDone={clearToast}
            />
        )}
    </div>
);
}

export default StockManagement;
