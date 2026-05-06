import React from "react";
import BASE_URL from "../../../hooks/server/config.js";
import getAuthHeaders from "../../../hooks/server/getAuthHeaders.js";
import "../inventory/EditProduct.css";
import Toast from "./Toast.jsx";
import { useToast } from "../../../hooks/useToast.js";

function RemoveProductModal({ item, onClose, onRemoved }) {
    const {toast, showToast, clearToast} = useToast();

    const handleRemove = async () => {
        try {
            const variantId = item?.variant_id;
            if (!variantId) {
                showToast("Missing variant id for this item.");
                return;
            }

            const response = await fetch(`${BASE_URL}/removeproduct/${variantId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                showToast("Product removed successfully");
                
                // update parent UI
                if (onRemoved) onRemoved(item.product_id);

                onClose(); // close modal
            } else {
                showToast(data.error || "Failed to remove product.");
            }
        } catch (error) {
            alert("Server Error");
        }
    };

    return (
        <div className="modal-edit-product">
            <div className="modal-content">
                <h1>Confirm Removal</h1>
                <p>Are you sure you want to remove "{item?.product_name}"?</p>
            </div>

            <div className="modal-buttons">
                <button className="remove-btn" onClick={handleRemove}>Remove</button>
                <button className="cancel-btn" onClick={onClose}>Cancel</button>
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

export default RemoveProductModal;
