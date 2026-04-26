import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";

function AddBrand({ onClose, onRefresh }) {
    const [brand_name, setBrandName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/addbrand`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand_name, description }),
            });
            const data = await response.json();
            if (response.ok) {
                onRefresh();
                onClose();
                alert("Brand added successfully!");
            } else {
                alert(data.error);
            }
        } catch {
            alert("Server Error");
        }
        setIsLoading(false);
    };

    return (
        <div className="modal-add-product">
            <div className="modal-header">
                <h1>Add Brand</h1>
                <button type="button" onClick={onClose}>X</button>
            </div>
            <div className="add-product-form">
                <form>
                    <label className="required">Brand Name</label>
                    <input required type="text" className="input-product-detail" onChange={(e) => setBrandName(e.target.value)} placeholder="e.g: Boysen, Holcim" />

                    <label>Description</label>
                    <input type="text" className="input-product-detail" onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />

                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit} disabled={isLoading}>Add</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBrand;