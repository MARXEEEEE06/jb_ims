import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import AddSupplier from "../../components/features/suppliers/AddSupplier.jsx";
import EditSupplierStatus from "../../components/features/suppliers/EditSupplierStatus.jsx";
import BASE_URL from "../../hooks/server/config";
import "./Supplier.css";
import {
    plus,
    pencil
} from "../../assets/ui/Icons.js";

function Supplier() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showEditStatus, setShowEditStatus] = useState(false);
    const [pendingToggleItem, setPendingToggleItem] = useState(null);

    const fetchSuppliers = async () => {
        try {
            const response = await fetch(`${BASE_URL}/suppliers`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (response.ok) {
                const newItems = Array.isArray(data) ? data : [data];
                setItems(newItems);
                setSelectedItem(prev =>
                    prev ? newItems.find(i => i.sup_info_id === prev.sup_info_id) ?? null : null
                );
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Server Error");
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleStatusToggleClick = (e, item) => {
        e.stopPropagation();
        setPendingToggleItem(item);
        setShowEditStatus(true);
    };

    return (
        <>
            <div className="main-container">
                <HeaderOveriew />
                <Sidebar />
                <div className="container suppliers-container">
                    <div className="suppliers-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>SUPPLIER NAME</th>
                                    <th>PHONE / CONTACT NO.</th>
                                    <th>EMAIL ADDRESS</th>
                                    <th>ADDRESS</th>
                                    <th>TOTAL PRODUCTS</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="suppliers-tbody">
                                {items.map((item) => {
                                    const isSelected = selectedItem?.sup_info_id === item.sup_info_id;
                                    return (
                                        <tr
                                            key={item.sup_info_id}
                                            onClick={() =>
                                                setSelectedItem(prev =>
                                                    prev?.sup_info_id === item.sup_info_id ? null : item
                                                )
                                            }
                                            style={{ backgroundColor: isSelected ? '#ddd' : '' }}
                                        >
                                            <td>{item.name}</td>
                                            <td>{item.contact_num}</td>
                                            <td>{item.email}</td>
                                            <td>{item.address}</td>
                                            <td>{item.total_products}</td>
                                            <td>
                                                <div
                                                    className={`status-container ${item.status === 'Active' ? 'in-stock' : 'out-of-stock'} status-clickable`}
                                                    onClick={(e) => handleStatusToggleClick(e, item)}
                                                >
                                                    {item.status}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="supplier-actions-button">
                        <button className="addProd-btn" onClick={() => setShowAdd(true)}>
                            <img src={plus} /> Add Supplier
                        </button>
                        <button
                            className="editProd-btn"
                            onClick={() => {
                                if (!selectedItem) {
                                    alert("Select a supplier first");
                                    return;
                                }
                                setPendingToggleItem(selectedItem);
                                setShowEditStatus(true);
                            }}
                        >
                            <img src={pencil} /> Edit Status
                        </button>
                    </div>

                    {showAdd && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <AddSupplier
                                    onClose={() => setShowAdd(false)}
                                    onRefresh={fetchSuppliers}
                                />
                            </div>
                        </div>
                    )}

                    {showEditStatus && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <EditSupplierStatus
                                    item={pendingToggleItem}
                                    onClose={() => {
                                        setShowEditStatus(false);
                                        setPendingToggleItem(null);
                                    }}
                                    onConfirmed={(id, newStatus) => {
                                        setItems(prev =>
                                            prev.map(i =>
                                                i.sup_info_id === id ? { ...i, status: newStatus } : i
                                            )
                                        );
                                        setSelectedItem(null);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Supplier;
