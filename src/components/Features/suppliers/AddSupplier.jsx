import React, { useState } from "react";
import BASE_URL from "../../../hooks/server/config";
import "./AddSupplier.css";

function AddSupplier({ onClose, onRefresh }) {
    const [supplier_name, setSupplierName] = useState('');
    const [contact_no, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [total_products, setTotalProducts] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/add-supplier`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supplier_name,
                    contact_no,
                    email,
                    address,
                    total_products: Number(total_products) || 0,
                    status: "Active" // default, handled on backend too
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
                <form>
                    <label className="required" htmlFor="supplier_name">Supplier Name</label>
                    <input required type="text" id="supplier_name" className="input-product-detail" onChange={(e) => setSupplierName(e.target.value)} placeholder="e.g: ABC Supplies Co." />

                    <label className="required" htmlFor="contact_no">Phone / Contact No.</label>
                    <input required type="text" id="contact_no" className="input-product-detail" onChange={(e) => setContactNo(e.target.value)} placeholder="e.g: 09XX-XXX-XXXX" />

                    <label className="required" htmlFor="email">Email Address</label>
                    <input required type="email" id="email" className="input-product-detail" onChange={(e) => setEmail(e.target.value)} placeholder="e.g: supplier@email.com" />

                    <label className="required" htmlFor="address">Address</label>
                    <input required type="text" id="address" className="input-product-detail" onChange={(e) => setAddress(e.target.value)} placeholder="e.g: 123 Street, City" />

                    <label className="required" htmlFor="total_products">Total Products</label>
                    <input required type="number" id="total_products" className="input-product-detail" onChange={(e) => setTotalProducts(e.target.value)} placeholder="e.g: 10" />

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