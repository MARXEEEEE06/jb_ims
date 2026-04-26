import React from "react";
import BASE_URL from "../../../hooks/server/config";

function RemoveBrand({ item, onClose, onRemoved }) {
    const handleRemove = async () => {
        try {
            const response = await fetch(`${BASE_URL}/removebrand/${item.brand_id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (response.ok) {
                alert("Brand removed successfully");
                if (onRemoved) onRemoved(item.brand_id);
                onClose();
            } else {
                alert(data.error);
            }
        } catch {
            alert("Server Error");
        }
    };

    return (
        <div className="modal-edit-product">
            <div className="modal-header">
                <h1>Confirm Removal</h1>
            </div>
            <div className="modal-content">
                <p>Are you sure you want to remove <strong>{item?.brand_name}</strong>?</p>
                <p>Products linked to this brand will have their brand set to none.</p>
            </div>
            <div className="form-button">
                <button className="removeProd-btn" onClick={handleRemove}>Remove</button>
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default RemoveBrand;