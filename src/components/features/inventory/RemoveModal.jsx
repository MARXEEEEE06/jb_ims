import React from "react";
import BASE_URL from "../../../hooks/server/config";
import getAuthHeaders from "../../../hooks/server/getAuthHeaders.js";
import "./EditProduct.css";

function RemoveProduct({ item, onClose, onRemoved }) {

    const handleRemove = async () => {
        try {
            const variantId = item?.variant_id;
            if (!variantId) {
                alert("Missing variant id for this item.");
                return;
            }

            const response = await fetch(`${BASE_URL}/removeproduct/${variantId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                alert("Product removed successfully");
                
                // update parent UI
                if (onRemoved) onRemoved(item.product_id);

                onClose(); // close modal
            } else {
                alert(data.error || "Failed to remove product.");
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
        </div>
    );
}

export default RemoveProduct;
