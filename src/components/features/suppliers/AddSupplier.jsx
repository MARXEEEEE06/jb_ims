import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import "./AddSupplier.css";

function AddSupplier({ onClose, onRefresh }) {
    const [name, setName] = useState('');
    const [contact_num, setContactNum] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        // Name: required, 2–100 chars, letters/spaces/hyphens/apostrophes only
        const trimmedName = name.trim();
        if (!trimmedName) {
            newErrors.name = "Supplier name is required.";
        } else if (trimmedName.length < 2 || trimmedName.length > 100) {
            newErrors.name = "Name must be 2–100 characters.";
        } else if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
            newErrors.name = "Name can only contain letters, spaces, hyphens, and apostrophes.";
        }

        // Phone: PH mobile format 09XXXXXXXXX
        const trimmedPhone = contact_num.trim();
        if (!trimmedPhone) {
            newErrors.contact_num = "Contact number is required.";
        } else if (!/^09\d{9}$/.test(trimmedPhone)) {
            newErrors.contact_num = "Enter a valid PH mobile number (e.g. 09171234567).";
        }

        // Email: standard format
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            newErrors.email = "Email address is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Enter a valid email address.";
        }

        // Address: required, min 5 chars, not numeric-only
        const trimmedAddress = address.trim();
        if (!trimmedAddress) {
            newErrors.address = "Address is required.";
        } else if (trimmedAddress.length < 5) {
            newErrors.address = "Address must be at least 5 characters.";
        } else if (/^\d+$/.test(trimmedAddress)) {
            newErrors.address = "Address cannot be numbers only.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/suppliers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    contact_num: contact_num.trim(),
                    email: email.trim().toLowerCase(),
                    address: address.trim()
                })
            });
            const data = await response.json();
            if (response.ok) {
                onRefresh();
                onClose();
                alert("Supplier added successfully!");
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Server Error");
        }
        setIsLoading(false);
    };

    return (
        <div className="modal-add-product">
            <div className="modal-header">
                <h1>Add Supplier</h1>
                <button type="button" onClick={onClose}>X</button>
            </div>
            <div className="add-product-form">
                <form onSubmit={handleSubmit}>
                    <label className="required" htmlFor="name">Supplier Name</label>
                    <input
                        type="text"
                        id="name"
                        className={`input-product-detail ${errors.name ? 'input-error' : ''}`}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g: Santos Construction Supply"
                    />
                    {errors.name && <span className="error-msg">{errors.name}</span>}

                    <label className="required" htmlFor="contact_num">Phone / Contact No.</label>
                    <input
                        type="text"
                        id="contact_num"
                        className={`input-product-detail ${errors.contact_num ? 'input-error' : ''}`}
                        onChange={(e) => setContactNum(e.target.value)}
                        placeholder="e.g: 09171234567"
                        maxLength={11}
                    />
                    {errors.contact_num && <span className="error-msg">{errors.contact_num}</span>}

                    <label className="required" htmlFor="email">Email Address</label>
                    <input
                        type="text"
                        id="email"
                        className={`input-product-detail ${errors.email ? 'input-error' : ''}`}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g: supplier@email.com"
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}

                    <label className="required" htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        className={`input-product-detail ${errors.address ? 'input-error' : ''}`}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g: Quezon City"
                    />
                    {errors.address && <span className="error-msg">{errors.address}</span>}

                    <div className="form-button">
                        <button type="submit" className="add-btn" disabled={isLoading}>Add</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSupplier;