import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import ConfirmModal from "../modals/ConfirmModal";

function AddBrand({ onClose, onRefresh, brands = [] }) {
    const [brand_name, setBrandName] = useState('');
    const [description, setDescription] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const duplicate = brands.some(
            b => b.brand_name.toLowerCase() === brand_name.trim().toLowerCase()
        );
        if (!brand_name.trim()) {
            setErrors({ brand_name: 'Brand name is required.' });
            return;
        }
        if (duplicate) {
            setErrors({ brand_name: 'Brand already exists.' });
            return;
        }
        setErrors({});
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/addbrand`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ brand_name, description }),
            });
            const data = await response.json();
            if (response.ok) {
                onRefresh();
                onClose();
            } else {
                setShowConfirm(false);
                setErrors({ form: data.error });
            }
        } catch {
            setShowConfirm(false);
            setErrors({ form: 'Server Error' });
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
                    <input
                        required
                        type="text"
                        className={`input-product-detail${errors.brand_name ? ' input-error' : ''}`}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g: Boysen, Holcim"
                    />
                    {errors.brand_name && <span className="error-msg">{errors.brand_name}</span>}

                    <label>Description</label>
                    <input
                        type="text"
                        className="input-product-detail"
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description"
                    />
                    {errors.form && <span className="error-msg">{errors.form}</span>}

                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit} disabled={isLoading}>Add</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>

            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ConfirmModal
                            message={`Add "${brand_name}" as a new brand?`}
                            onConfirm={handleConfirm}
                            onCancel={() => setShowConfirm(false)}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddBrand;