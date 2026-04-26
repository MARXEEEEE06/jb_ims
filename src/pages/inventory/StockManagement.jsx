import { useState, useEffect } from "react";
import BASE_URL from "../../hooks/server/config";
import getStatusClass from "../../hooks/inventory/GetStatus";
import HeaderOveriew from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import "./StockManagement.css";

function StockManagement() {
    const [items, setItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [adjustment, setAdjustment] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchInventory = async () => {
        try {
            const response = await fetch(`${BASE_URL}/inventory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    const closeModal = () => {
        setActiveItem(null);
        setAdjustment(0);
        setError("");
        setIsSaving(false);
    };

    const openModal = (item) => {
        setActiveItem(item);
        setAdjustment(0);
        setError("");
    };

    const handleStockChange = async (variantId, delta) => {
        if (!delta || Number.isNaN(Number(delta))) {
            setError("Please enter a valid adjustment.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/stock/${variantId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ adjustment: Number(delta) }),
            });

            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                await fetchInventory();
                closeModal();
            } else {
                setError(data.error || "Failed to update stock.");
            }
        } catch (e) {
            setError("Server error");
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
                            <h2>Adjust Stock</h2>
                            <div className="stock-modal-meta">
                                <div><strong>Item:</strong> {activeItem.product_name}</div>
                                <div><strong>Variant:</strong> {activeItem.variant}</div>
                                <div><strong>Current Qty:</strong> {activeItem.quantity}</div>
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
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleStockChange(activeItem.variant_id, adjustment);
                                    }
                                }}
                                disabled={isSaving}
                            />

                            <div className="stock-macro-row">
                                <button type="button" onClick={() => setAdjustment((prev) => Number(prev || 0) - 10)} disabled={isSaving}>-10</button>
                                <button type="button" onClick={() => setAdjustment((prev) => Number(prev || 0) - 5)} disabled={isSaving}>-5</button>
                                <button type="button" onClick={() => setAdjustment((prev) => Number(prev || 0) - 1)} disabled={isSaving}>-1</button>
                                <button type="button" onClick={() => setAdjustment((prev) => Number(prev || 0) + 1)} disabled={isSaving}>+1</button>
                                <button type="button" onClick={() => setAdjustment((prev) => Number(prev || 0) + 5)} disabled={isSaving}>+5</button>
                                <button type="button" onClick={() => setAdjustment((prev) => Number(prev || 0) + 10)} disabled={isSaving}>+10</button>
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
                                    onClick={() => handleStockChange(activeItem.variant_id, adjustment)}
                                    disabled={isSaving || !Number(adjustment)}
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                                <button type="button" className="cancel-btn" onClick={closeModal} disabled={isSaving}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StockManagement;

