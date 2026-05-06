import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import AddBrand from "../../components/features/brands/AddBrand.jsx";
import EditBrand from "../../components/features/brands/EditBrand.jsx";
import ConfirmModal from "../../components/features/modals/ConfirmModal.jsx";
import Toast from "../../components/features/modals/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import BASE_URL from "../../hooks/server/config";
import "./Brand.css";
import { plus, pencil } from "../../assets/ui/Icons.js";
import { useKeywordFilter } from '../../hooks/filters/useKeywordFilter';
import { useStatusFilter } from '../../hooks/filters/useStatusFilter';
import { useSort } from '../../hooks/filters/useSort';

function Brand() {
    const [items, setItems] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const { toast, showToast, clearToast } = useToast();

    const { filtered: keywordFiltered, keyword, setKeyword } = useKeywordFilter(items, ['brand_name', 'description']);
    const { filtered: statusFiltered, status, setStatus } = useStatusFilter(keywordFiltered, 'status');
    const { sorted: finalFiltered, sortKey, setSortKey, order, setOrder } = useSort(statusFiltered);

    const fetchBrands = async () => {
        try {
            const response = await fetch(`${BASE_URL}/getbrands`);
            const data = await response.json();
            if (response.ok) {
                setItems(Array.isArray(data) ? data : [data]);
                setSelectedItem(prev =>
                    prev ? data.find(i => i.brand_id === prev.brand_id) ?? null : null
                );
            } else {
                showToast(data.error);
            }
        } catch {
            alert("Server Error");
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleStatusToggleClick = (e, item) => {
        e.stopPropagation();
        setConfirmModal({ item });
    };

    const handleStatusConfirm = async () => {
        const item = confirmModal.item;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/editBrand/status/${item.brand_id}`, {
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
                        i.brand_id === item.brand_id ? { ...i, status: data.status } : i
                    )
                );
            } else {
                showToast(data.error);
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
                    field="brand_name"
                    keyword={keyword}
                    setKeyword={setKeyword}
                />
                <Sidebar />
                <div className="container brands-container">
                    <div className="filters-panel">
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
                            <option value="">Sort by...</option>
                            <option value="brand_name">Alphabetical</option>
                            <option value="total_products">Total Products</option>
                        </select>
                        <select value={order} onChange={e => setOrder(e.target.value)}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    <p className="results-count">{finalFiltered.length} result{finalFiltered.length !== 1 ? 's' : ''}</p>

                    <div className="product-actions-button">
                        <button className="addProd-btn" onClick={() => setShowAdd(true)}>
                            <img src={plus} alt=""/> Add Brand
                        </button>
                        <button
                            className="editProd-btn"
                            onClick={() => {
                                if (!selectedItem) { showToast("Select a brand first"); return; }
                                setShowEdit(true);
                            }}
                        >
                            <img src={pencil} alt=""/> Edit Brand
                        </button>
                    </div>

                    <div className="brands-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>BRAND NAME</th>
                                    <th>DESCRIPTION</th>
                                    <th>TOTAL PRODUCTS</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="brands-tbody">
                                {finalFiltered.map((item) => {
                                    const isSelected = selectedItem?.brand_id === item.brand_id;
                                    return (
                                        <tr
                                            className='tr-selectable'
                                            key={item.brand_id}
                                            onClick={() =>
                                                setSelectedItem(prev =>
                                                    prev?.brand_id === item.brand_id ? null : item
                                                )
                                            }
                                            style={{ backgroundColor: isSelected ? '#ddd' : '' }}
                                        >
                                            <td>{item.brand_name}</td>
                                            <td>{item.description || '—'}</td>
                                            <td>{item.total_products}</td>
                                            <td>
                                                <div
                                                    className={`status-container ${item.status === 'active' ? 'status-in' : 'status-out'} status-clickable`}
                                                    onClick={(e) => handleStatusToggleClick(e, item)}
                                                >
                                                    {item.status === 'active' ? 'Active' : 'Inactive'}
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
                                <AddBrand
                                    onClose={() => setShowAdd(false)}
                                    onRefresh={fetchBrands}
                                    brands={items}
                                />
                            </div>
                        </div>
                    )}
                    {showEdit && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <EditBrand
                                    item={selectedItem}
                                    onClose={() => setShowEdit(false)}
                                    onRefresh={fetchBrands}
                                    brands={items}
                                />
                            </div>
                        </div>
                    )}
                    {confirmModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <ConfirmModal
                                    message={`Set "${confirmModal.item.brand_name}" to ${confirmModal.item.status === 'active' ? 'Inactive' : 'Active'}?`}
                                    onConfirm={handleStatusConfirm}
                                    onCancel={() => setConfirmModal(null)}
                                />
                            </div>
                        </div>
                    )}
                    {toast && (
                        <Toast
                            key={toast.key}
                            message={toast.message}
                            duration={toast.duration}
                            onDone={clearToast}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default Brand;
