import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import ConfirmModal from "../modals/ConfirmModal";

function EditBrand({ item, onClose, onRefresh, brands = [] }) {
    const [brand_name, setBrandName] = useState(item?.brand_name || '');
    const [description, setDescription] = useState(item?.description || '');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!brand_name.trim()) {
            newErrors.brand_name = 'Brand name is required.';
        }
        const duplicate = brands.some(
            b => b.brand_name.toLowerCase() === brand_name.trim().toLowerCase()
                && b.brand_id !== item.brand_id
        );
        if (duplicate) {
            newErrors.brand_name = 'Brand already exists.';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/editBrand`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ brand_id: item.brand_id, brand_name, description }),
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
        <div className="modal-edit-product">
            <div className="modal-header">
                <h1>Edit Brand</h1>
                <button type="button" onClick={onClose}>X</button>
            </div>
            <div className="edit-product-form">
                <form>
                    <label className="required">Brand Name</label>
                    <input
                        required
                        type="text"
                        className={`input-product-detail${errors.brand_name ? ' input-error' : ''}`}
                        value={brand_name}
                        onChange={(e) => setBrandName(e.target.value)}
                    />
                    {errors.brand_name && <span className="error-msg">{errors.brand_name}</span>}

                    <label>Description</label>
                    <input
                        type="text"
                        className="input-product-detail"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    {errors.form && <span className="error-msg">{errors.form}</span>}

                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit} disabled={isLoading}>Save</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>

            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ConfirmModal
                            message={`Save changes to "${brand_name}"?`}
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

export default EditBrand;