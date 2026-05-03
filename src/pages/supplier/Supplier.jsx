import React, { useState, useEffect } from 'react';
import BASE_URL from "../../hooks/server/config";

import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import AddSupplier from "../../components/features/suppliers/AddSupplier.jsx";
import ConfirmModal from '../../components/features/modals/ConfirmModal.jsx';

import "./Supplier.css";
import { plus } from "../../assets/ui/Icons.js";

import { useKeywordFilter } from '../../hooks/filters/useKeywordFilter';
import { useStatusFilter } from '../../hooks/filters/useStatusFilter';
import { useSort } from '../../hooks/filters/useSort';

function Supplier() {
const [items, setItems] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [showAdd, setShowAdd] = useState(false);
const [confirmModal, setConfirmModal] = useState(null);

const { filtered: keywordFiltered, keyword, setKeyword } = useKeywordFilter(items, ['name', 'email', 'address', 'contact_num']);
const { filtered: statusFiltered, status, setStatus } = useStatusFilter(keywordFiltered, 'status');
const { sorted: finalFiltered, sortKey, setSortKey, order, setOrder } = useSort(statusFiltered);

const fetchSuppliers = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/suppliers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
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
    } catch {
        alert("Server Error");
    }
};

useEffect(() => {
    fetchSuppliers();
}, []);

const handleStatusToggleClick = (e, item) => {
    e.stopPropagation();
    setConfirmModal({ item });
};

const handleStatusConfirm = async () => {
    const item = confirmModal.item;
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/suppliers/status/${item.sup_info_id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        const data = await response.json();
        if (response.ok) {
            setItems(prev =>
                prev.map(i =>
                    i.sup_info_id === item.sup_info_id ? { ...i, status: data.status } : i
                )
            );
        } else {
            alert(data.error);
        }
    } catch {
        alert("Server Error");
    }
    setConfirmModal(null);
};


return (
    <>
        <div className="main-container">
            <HeaderOveriew
                items={items}
                field="name"
                keyword={keyword}
                setKeyword={setKeyword}
            />
            <Sidebar />
            <div className="container suppliers-container">
                <div className="filters-panel">
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
                        <option value="">Sort by...</option>
                        <option value="name">Alphabetical</option>
                        <option value="total_products">Total Products</option>
                    </select>
                    <select value={order} onChange={e => setOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                <div className="supplier-actions-button">
                    <button className="addProd-btn" onClick={() => setShowAdd(true)}>
                        <img src={plus} /> <p>Add Supplier</p>
                    </button>
                </div>

                <div className="item-table">
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
                            {finalFiltered.map((item) => {
                                // const isSelected = selectedItem?.sup_info_id === item.sup_info_id;
                                return (
                                    <tr
                                        // className='tr-selectable'
                                        key={item.sup_info_id}
                                        // onClick={() =>
                                        //     setSelectedItem(prev =>
                                        //         prev?.sup_info_id === item.sup_info_id ? null : item
                                        //     )
                                        // }
                                        // style={{ backgroundColor: isSelected ? '#ddd' : '' }}
                                    >
                                        <td>{item.name}</td>
                                        <td>{item.contact_num}</td>
                                        <td>{item.email}</td>
                                        <td>{item.address}</td>
                                        <td>{item.total_products}</td>
                                        <td>
                                            <div
                                                className={`status-container ${item.status === 'Active' ? 'status-in' : 'status-out'} status-clickable`}
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
                {confirmModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <ConfirmModal
                                message={`Set "${confirmModal.item.name}" to ${confirmModal.item.status === 'active' ? 'Inactive' : 'Active'}?`}
                                onConfirm={handleStatusConfirm}
                                onCancel={() => setConfirmModal(null)}
                                suppliers={items}
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