import React from "react";
import BASE_URL from "../../../hooks/server/config.js";
import "./EditSupplierStatus.css";

function EditSupplierStatus({ item, onClose, onConfirmed }) {
    const newStatus = item?.status === "Active" ? "Inactive" : "Active";

    const handleConfirm = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/suppliers/status/${item.sup_info_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (response.ok) {
                alert(`Supplier marked as ${newStatus}`);
                if (onConfirmed) onConfirmed(item.sup_info_id, newStatus);
                onClose();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Server Error");
        }
    };

    return (
        <div className="modal-edit-product">
            <div className="modal-content">
                <h1>Confirm Status Change</h1>
                <p>Set "{item?.name}" to <strong>{newStatus}</strong>?</p>
            </div>
            <div className="modal-buttons">
                <button className="add-btn" onClick={handleConfirm}>Confirm</button>
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default EditSupplierStatus;
