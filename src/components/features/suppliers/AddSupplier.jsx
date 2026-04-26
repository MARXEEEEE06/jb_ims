import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import "./AddSupplier.css";

function AddSupplier({ onClose, onRefresh }) {
    const [name, setName] = useState('');
    const [contact_num, setContactNum] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/suppliers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, contact_num, email, address })
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
                <form>
                    <label className="required" htmlFor="name">Supplier Name</label>
                    <input required type="text" id="name" className="input-product-detail" onChange={(e) => setName(e.target.value)} placeholder="e.g: Santos Construction Supply" />

                    <label className="required" htmlFor="contact_num">Phone / Contact No.</label>
                    <input required type="text" id="contact_num" className="input-product-detail" onChange={(e) => setContactNum(e.target.value)} placeholder="e.g: 09171234567" maxLength={11} />

                    <label className="required" htmlFor="email">Email Address</label>
                    <input required type="email" id="email" className="input-product-detail" onChange={(e) => setEmail(e.target.value)} placeholder="e.g: supplier@email.com" />

                    <label className="required" htmlFor="address">Address</label>
                    <input required type="text" id="address" className="input-product-detail" onChange={(e) => setAddress(e.target.value)} placeholder="e.g: Quezon City" />

                    <div className="form-button">
                        <button className="add-btn" onClick={handleSubmit} disabled={isLoading}>Add</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSupplier;
