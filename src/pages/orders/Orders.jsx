import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import ReceiptModal from "../../components/features/orders/ReceiptModal.jsx";
import useAuth from "../../hooks/UserAuth";
import BASE_URL from "../../hooks/server/config.js";
import "../../css/Site.css";
import "./Orders.css";

import getStatusClass from '../../hooks/inventory/GetStatus.js';
import { useKeywordFilter } from '../../hooks/filters/useKeywordFilter';
import { useBrandFilter } from '../../hooks/filters/useBrandFilter';
import { useSupplierFilter } from '../../hooks/filters/useSupplierFilter';
import { useStatusFilter } from '../../hooks/filters/useStatusFilter';
import { useSort } from '../../hooks/filters/useSort';

function Orders() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);         // ✅ single source of truth
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState({ name: '', address: '', contact: '' });
    const [payment, setPayment] = useState({ method: 'cash', tendered: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

    // ✅ Filter/sort chain on items
    const { filtered: keywordFiltered, keyword, setKeyword } = useKeywordFilter(items);
    const { filtered: brandFiltered, brand, setBrand, brands } = useBrandFilter(keywordFiltered, items);
    const { filtered: supplierFiltered, supplier, setSupplier, suppliers } = useSupplierFilter(brandFiltered, items);
    const { filtered: statusFiltered, status, setStatus } = useStatusFilter(supplierFiltered, 'status');
    const { sorted: finalFiltered, sortKey, setSortKey, order, setOrder } = useSort(statusFiltered);

    // ✅ Single fetch, sets items only
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${BASE_URL}/inventory`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                const data = await response.json();
                if (response.ok) setItems(Array.isArray(data) ? data : [data]);
                else alert(data.error);
            } catch { alert('Failed to load products'); }
            finally { setIsLoading(false); }
        };
        fetchInventory();
    }, []);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.product_id);
            if (existing) {
                return prev.map(i =>
                    i.product_id === product.product_id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQty = (product_id, qty) => {
        if (qty < 1) return removeFromCart(product_id);
        setCart(prev => prev.map(i =>
            i.product_id === product_id ? { ...i, quantity: qty } : i
        ));
    };

    const removeFromCart = (product_id) => {
        setCart(prev => prev.filter(i => i.product_id !== product_id));
    };

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.10);
    const grandTotal = subtotal + tax;
    const change = (Number(payment.tendered) || 0) - grandTotal;

    const handleSubmit = async () => {
        if (!customer.name) return alert('Enter customer name');
        if (cart.length === 0) return alert('Add items to order');
        if (!payment.tendered || Number(payment.tendered) < grandTotal)
            return alert('Amount tendered is less than grand total');

        setIsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login_id: user?.user_id,
                    customer_name: customer.name,
                    customer_address: customer.address,
                    customer_contact: customer.contact,
                    items: cart.map(i => ({
                        product_id: i.product_id,
                        quantity: i.quantity,
                        price: i.price
                    })),
                    amount_tendered: Number(payment.tendered),
                    payment_method: payment.method
                })
            });
            const data = await res.json();
            if (res.ok) {
                setReceipt({
                    ...data,
                    items: cart.map(i => ({
                        product_id: i.product_id,
                        prod_name: i.prod_name,
                        quantity: i.quantity,
                        price: i.price
                    })),
                    customer_address: customer.address,
                    customer_contact: customer.contact
                });
                setShowReceipt(true);
                setCart([]);
                setCustomer({ name: '', address: '', contact: '' });
                setPayment({ method: 'cash', tendered: '' });
            } else {
                alert(data.error);
            }
        } catch { alert('Server error'); }
        setIsLoading(false);
    };

    return (
        <div className="main-container">
            <HeaderOveriew
                items={items}
                field="prod_name"
                keyword={keyword}
                setKeyword={setKeyword}
            />
            <Sidebar />
            <div className="container orders-container">

                {/* LEFT — Product List */}
                <div className="orders-products">
                    <h2>Products</h2>

                    {/* ✅ Filter/Sort Panel */}
                    <div className="filters-panel">
                        <select value={brand} onChange={e => setBrand(e.target.value)}>
                            <option value="">All Brands</option>
                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select value={supplier} onChange={e => setSupplier(e.target.value)}>
                            <option value="">All Suppliers</option>
                            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="critical">Critical</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                        <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
                            <option value="">Sort by...</option>
                            <option value="prod_name">Alphabetical</option>
                            <option value="stock_quantity">Stock</option>
                            <option value="status">Status</option>
                        </select>
                        <select value={order} onChange={e => setOrder(e.target.value)}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    {isLoading ? <p>Loading...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>PRODUCT</th>
                                    <th>BRAND</th>
                                    <th>PRICE</th>
                                    <th>STOCK</th>
                                    <th>STATUS</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* ✅ use finalFiltered instead of products */}
                                {finalFiltered.filter(p => p.stock_quantity > 0).map(p => (
                                    <tr key={p.product_id}>
                                        <td>{p.prod_name}</td>
                                        <td>{p.brand}</td>
                                        <td>₱{p.price}</td>
                                        <td>{p.stock_quantity}</td>
                                        <td>
                                            <div className={`status-container ${getStatusClass(p.stock_quantity)}`}>
                                                {p.status}
                                            </div>
                                        </td>
                                        <td>
                                            <button onClick={() => addToCart(p)}>Add</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* RIGHT — Order Summary */}
                <div className="orders-summary">
                    <h2>Order Summary</h2>
                    <div className="customer-info">
                        <input
                            placeholder="Customer Name *"
                            value={customer.name}
                            onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))} />
                        <input
                            placeholder="Address"
                            value={customer.address}
                            onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))} />
                        <input
                            placeholder="Contact Number"
                            value={customer.contact}
                            onChange={e => setCustomer(p => ({ ...p, contact: e.target.value }))} />
                    </div>
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p className="empty-cart">No items added yet.</p>
                        ) : cart.map(i => (
                            <div className="cart-row" key={i.product_id}>
                                <span>{i.prod_name}</span>
                                <div className="qty-control">
                                    <button onClick={() => updateQty(i.product_id, i.quantity - 1)}>-</button>
                                    <span>{i.quantity}</span>
                                    <button onClick={() => updateQty(i.product_id, i.quantity + 1)}>+</button>
                                </div>
                                <span>₱{i.price * i.quantity}</span>
                                <button className="remove-btn" onClick={() => removeFromCart(i.product_id)}>✕</button>
                            </div>
                        ))}
                    </div>
                    <div className="order-totals">
                        <div><span>Subtotal</span><span>₱{subtotal}</span></div>
                        <div><span>Tax (10%)</span><span>₱{tax}</span></div>
                        <div className="grand-total"><span>Grand Total</span><span>₱{grandTotal}</span></div>
                    </div>
                    <div className="payment-info">
                        <select
                            value={payment.method}
                            onChange={e => setPayment(p => ({ ...p, method: e.target.value }))}>
                            <option value="cash">Cash</option>
                            <option value="COD">COD</option>
                            <option value="gcash">GCash</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Amount Tendered"
                            value={payment.tendered}
                            onChange={e => setPayment(p => ({ ...p, tendered: e.target.value }))} />
                        {payment.tendered && (
                            <div className="change-display">
                                Change: ₱{change >= 0 ? change : 0}
                            </div>
                        )}
                    </div>
                    <button
                        className="submit-order-btn"
                        onClick={handleSubmit}
                        disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Submit Order'}
                    </button>
                </div>
            </div>

            {showReceipt && receipt && (
                <ReceiptModal
                    receipt={receipt}
                    onClose={() => setShowReceipt(false)} />
            )}
        </div>
    );
}

export default Orders;