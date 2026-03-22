import React from "react";

function RemoveProduct({ item, onClose, onRemoved }) {

    const handleRemove = async () => {
        try {
            const response = await fetch(
                `http://192.168.254.142:5000/api/removeproduct/${item.product_id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Product removed successfully");
                
                // update parent UI
                if (onRemoved) onRemoved(item.product_id);

                onClose(); // close modal
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
                <h1>Confirm Removal</h1>
                <p>Are you sure you want to remove "{item?.prod_name}"?</p>
            </div>

            <div className="modal-buttons">
                <button onClick={handleRemove}>Remove</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default RemoveProduct;