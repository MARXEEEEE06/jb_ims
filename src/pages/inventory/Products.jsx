import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import BASE_URL from "../../hooks/server/config"
import getStatusClass from '../../hooks/inventory/GetStatus.js';
import getAuthHeaders from "../../hooks/server/getAuthHeaders.js";
import { COLUMNS } from '../../hooks/data/tableColumns.js';

import HeaderOveriew from "../../components/header/Header.jsx";
import AddProduct from "../../components/features/inventory/AddProduct.jsx";
import EditProduct from "../../components/features/inventory/EditProduct.jsx";
import RemoveProduct from '../../components/features/modals/RemoveProductModal.jsx';
import Toast from "../../components/features/modals/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import "./Products.css";
import "./Inventory.jsx"

import { 
    plus,
    pencil,
    trashbin
} from "../../assets/ui/Icons.js";

// Import filter hooks
import { useKeywordFilter } from '../../hooks/filters/useKeywordFilter';
import { useBrandFilter } from '../../hooks/filters/useBrandFilter';
import { useSupplierFilter } from '../../hooks/filters/useSupplierFilter';
import { useStatusFilter } from '../../hooks/filters/useStatusFilter';
import { useSort } from '../../hooks/filters/useSort';

function Products(){
const [items, setItems] = useState([]);
const { filtered: keywordFiltered, keyword, setKeyword } = useKeywordFilter(items);
const { filtered: brandFiltered, brand, setBrand, brands } = useBrandFilter(keywordFiltered, items);
const { filtered: supplierFiltered, supplier, setSupplier, suppliers } = useSupplierFilter(brandFiltered, items);
const { filtered: statusFiltered, status, setStatus } = useStatusFilter(supplierFiltered, 'quantity');
const { sorted: finalFiltered, sortKey, setSortKey, order, setOrder } = useSort(statusFiltered);

const [showAdd, setShowAdd] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const [showRemove, setShowRemove] = useState(false);
const { toast, showToast, clearToast } = useToast();

const [selectedItem, setSelectedItem] = useState(null);

const visibleKeys = ['sku', 'product-name', 'brand', 'variant', 'price', 'type', 'category', 'status'];
const columns = COLUMNS.filter(col => visibleKeys.includes(col.key));

const fetchInventory = async () => {
    try {
        const response = await fetch(`${BASE_URL}/inventory`, {
            method: "POST",
            headers: getAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({}),
        });
        const data = await response.json();
        if (response.ok) {
            const newItems = Array.isArray(data) ? data : [data];
            setItems(newItems);

            // ✅ sync selectedItem with the updated data
            setSelectedItem(prev =>
                prev ? newItems.find(i => i.product_id === prev.product_id) ?? null : null
            );
        } else {
            // showToast(data.error);
            showToast(data.eror);
        }
    } catch (error) {
        alert("Server Error");
    }
};

useEffect(() => {
    fetchInventory(); // still runs on mount
}, []);

getStatusClass();

return(
    <>
        <div className="main-container">
            <HeaderOveriew
                items={items}
                field="product_name"
                keyword={keyword}
                setKeyword={setKeyword}
            />
            <Sidebar />
            <div className="container products-container">
                <div className="filters-panel">
                    <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                        <option value="">All Brands</option>
                        {brands.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                        <option value="">All Suppliers</option>
                        {suppliers.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="in-stock">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="critical">Critical</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                        <option value="">Sort by...</option>
                        <option value="product_name">Alphabetical</option>
                        <option value="quantity">Stock</option>
                        <option value="status">Status</option>
                    </select>
                    <select value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
                <div className="product-actions-button">
                    <button className="addProd-btn" onClick={() => setShowAdd(true)}><img src={plus} alt=""/> Add Product</button>
                    <button
                        className="editProd-btn"
                        onClick={() => {
                            if (!selectedItem) { showToast("Select a product first"); return; }
                            setShowEdit(true);
                    }}>
                        <img src={pencil} alt=""/> Edit Product
                    </button>
                    <button 
                        className="removeProd-btn" 
                            onClick={() => {
                            if (!selectedItem) { showToast("Select a product first"); return; }
                            setShowRemove(true);
                        }}>
                        <img src={trashbin} alt=""/> 
                        Remove Product</button>
                </div>

                <p className="results-count">{finalFiltered.length} result{finalFiltered.length !== 1 ? 's' : ''}</p>
                <div className="products-table">
                    <table>
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className={col.key}>{col.label}</th>
                                ))}
                                </tr>
                        </thead>
                        <tbody className="products-tbody">
                        {finalFiltered.map((item) => {
                            const isSelected = selectedItem?.product_id === item.product_id;

                            return (
                                <tr
                                    className='tr-selectable'
                                    key={item.product_id}
                                    onClick={() =>
                                        setSelectedItem(prev =>
                                            prev?.product_id === item.product_id ? null : item
                                        )
                                    }
                                    style={{ backgroundColor: isSelected ? '#ddd' : '' }}
                                >
                                    <td>{item.sku}</td>
                                    <td>{item.product_name}</td>
                                    <td>{item.brand ?? 'N/A'}</td>
                                    <td>{item.variant}</td>
                                    <td>{item.price}</td>
                                    <td>{item.unit_type}</td>
                                    <td>{item.category_type}</td>
                                    <td>
                                        <div className={`status-container ${getStatusClass(item.quantity)}`}>
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
                            <AddProduct 
                            onClose={() => setShowAdd(false)} 
                            onRefresh={fetchInventory} />
                        </div>
                    </div>
                )}
                {showEdit && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <EditProduct 
                                item={selectedItem}
                                onClose={() => setShowEdit(false)}
                                onRefresh={fetchInventory}
                                onToast={showToast} />
                        </div>
                    </div>
                )}
                {showRemove && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <RemoveProduct 
                                item={selectedItem}
                                onClose={() => setShowRemove(false)}
                                onRemoved={(id) => {
                                    setItems(prev => prev.filter(item => item.product_id !== id));
                                    setSelectedItem(null); // 🔴 CLEAR selection
                                }}
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
);}

export default Products;
