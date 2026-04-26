import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";

function EditBrand({ item, onClose, onRefresh }) {
    const [brand_name, setBrandName] = useState(item?.brand_name || '');
    const [description, setDescription] = useState(item?.description || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/editbrand`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand_id: item.brand_id, brand_name, description }),
            });
            const data = await response.json();
            if (response.ok) {
                onRefresh();
                onClose();
                alert("Brand updated successfully!");
            } else {
                alert(data.error);
            }
        } catch {
            alert("Server Error");
        }
        setIsLoading(false);
    };

    return (
        <div className="modal-edit-product">
            <div className="modal-header">
                <h1>Edit Brand</h1>
                <button type="button" onClick={onClose}>X</button>
            </div>
            <div className="edit-product-form">
                <form>
                    <label className="required">Brand Name</label>
                    <input required type="text" className="input-product-detail" value={brand_name} onChange={(e) => setBrandName(e.target.value)} />

                    <label>Description</label>
                    <input type="text" className="input-product-detail" value={description} onChange={(e) => setDescription(e.target.value)} />

                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit} disabled={isLoading}>Save</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditBrand;