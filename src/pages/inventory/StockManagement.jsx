import { useState, useEffect } from "react";
import BASE_URL from "../../hooks/server/config";
import getStatusClass from "../../hooks/inventory/GetStatus";
import getAuthHeaders from "../../hooks/server/getAuthHeaders.js";
import HeaderOveriew from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import "./StockManagement.css";

function StockManagement() {
    const [items, setItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [adjustment, setAdjustment] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [adjustType, setAdjustType] = useState('RESTOCK_SOLD');
    const [confirmStep, setConfirmStep] = useState(false);


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
                alert(data.error);
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
        setAdjustType('RESTOCK_SOLD');
        setConfirmStep(false);
    };

    // Update closeModal
    const closeModal = () => {
        setActiveItem(null);
        setAdjustment(0);
        setError("");
        setIsSaving(false);
        setAdjustType('RESTOCK_SOLD');
        setConfirmStep(false);
    };

    const handleStockChange = async (variantId, delta) => {
        if (!delta || Number.isNaN(Number(delta))) {
            setError("Please enter a valid adjustment.");
            return;
        }

        // derive type
        let type;
        if (adjustType === 'CORRECTION') {
            type = 'CORRECTION';
        } else {
            type = Number(delta) > 0 ? 'RESTOCK' : 'SOLD';
        }

        try {
            setIsSaving(true);
            setError("");

            const response = await fetch(`${BASE_URL}/stock/${variantId}`, {
                method: "PATCH",
                headers: { ...getAuthHeaders({ "Content-Type": "application/json" }) },
                body: JSON.stringify({ adjustment: Number(delta), type }),
            });

            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                await fetchInventory();
                closeModal();
            } else {
                setError(data.error || "Failed to update stock.");
                setConfirmStep(false);
            }
        } catch (e) {
            setError("Server error");
            setConfirmStep(false);
        } finally {
            setIsSaving(false);
        }
    };

    getStatusClass();

    return (
        <div className="main-container">
            <HeaderOveriew />
            <Sidebar />
            <div className="container stocks-container">
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
                        {items.map((item) => {
                            return (
                                <tr key={item.variant_id}>
                                    <td>{item.product_name}</td>
                                    <td>{item.variant}</td>
                                    <td>
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
                                            className={adjustType === 'RESTOCK_SOLD' ? 'active' : ''}
                                            onClick={() => setAdjustType('RESTOCK_SOLD')}
                                        >
                                            Restock / Sold
                                        </button>
                                        <button
                                            type="button"
                                            className={adjustType === 'CORRECTION' ? 'active' : ''}
                                            onClick={() => setAdjustType('CORRECTION')}
                                        >
                                            Correction
                                        </button>
                                    </div>

                                    <label className="stock-modal-label" htmlFor="stock-adjustment">Adjustment (+/-)</label>
                                    <input
                                        id="stock-adjustment"
                                        type="number"
                                        step="1"
                                        className="stock-adjustment-input"
                                        value={adjustment}
                                        onChange={(e) => setAdjustment(e.target.value === "" ? "" : Number(e.target.value))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && Number(adjustment)) {
                                                e.preventDefault();
                                                setConfirmStep(true);
                                            }
                                        }}
                                    />

                                    <div className="stock-macro-row">
                                        <button type="button" onClick={() => setAdjustment((p) => Number(p || 0) - 10)}>-10</button>
                                        <button type="button" onClick={() => setAdjustment((p) => Number(p || 0) - 5)}>-5</button>
                                        <button type="button" onClick={() => setAdjustment((p) => Number(p || 0) - 1)}>-1</button>
                                        <button type="button" onClick={() => setAdjustment((p) => Number(p || 0) + 1)}>+1</button>
                                        <button type="button" onClick={() => setAdjustment((p) => Number(p || 0) + 5)}>+5</button>
                                        <button type="button" onClick={() => setAdjustment((p) => Number(p || 0) + 10)}>+10</button>
                                    </div>

                                    <div className="stock-modal-preview">
                                        <strong>New Qty Preview:</strong>{" "}
                                        {Math.max(0, Number(activeItem.quantity) + Number(adjustment || 0))}
                                    </div>

                                    {error && <div className="stock-modal-error" role="alert">{error}</div>}

                                    <div className="stock-modal-actions">
                                        <button
                                            type="button"
                                            className="confirm-btn"
                                            onClick={() => setConfirmStep(true)}
                                            disabled={!Number(adjustment)}
                                        >
                                            Next
                                        </button>
                                        <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                                    </div>
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
        </div>
    );
}

export default StockManagement;
