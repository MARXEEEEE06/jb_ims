import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import AddBrand from "../../components/features/brands/AddBrand.jsx";
import EditBrand from "../../components/features/brands/EditBrand.jsx";
import RemoveBrand from "../../components/features/brands/RemoveBrand.jsx";
import BASE_URL from "../../hooks/server/config";
import "./Brand.css";
import { plus, pencil, trashbin } from "../../assets/ui/Icons.js";

function Brand() {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showRemove, setShowRemove] = useState(false);

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
                alert(data.error);
            }
        } catch {
            alert("Server Error");
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    return (
        <>
            <div className="main-container">
                <HeaderOveriew />
                <Sidebar />
                <div className="container brands-container">
                    <div className="brands-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>BRAND NAME</th>
                                    <th>DESCRIPTION</th>
                                    <th>TOTAL PRODUCTS</th>
                                </tr>
                            </thead>
                            <tbody className="brands-tbody">
                                {items.map((item) => {
                                    const isSelected = selectedItem?.brand_id === item.brand_id;
                                    return (
                                        <tr
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="product-actions-button">
                        <button className="addProd-btn" onClick={() => setShowAdd(true)}>
                            <img src={plus} /> Add Brand
                        </button>
                        <button
                            className="editProd-btn"
                            onClick={() => {
                                if (!selectedItem) { alert("Select a brand first"); return; }
                                setShowEdit(true);
                            }}
                        >
                            <img src={pencil} /> Edit Brand
                        </button>
                        <button
                            className="removeProd-btn"
                            onClick={() => {
                                if (!selectedItem) { alert("Select a brand first"); return; }
                                setShowRemove(true);
                            }}
                        >
                            <img src={trashbin} /> Remove Brand
                        </button>
                    </div>

                    {showAdd && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <AddBrand
                                    onClose={() => setShowAdd(false)}
                                    onRefresh={fetchBrands}
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
                                />
                            </div>
                        </div>
                    )}

                    {showRemove && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <RemoveBrand
                                    item={selectedItem}
                                    onClose={() => setShowRemove(false)}
                                    onRemoved={(id) => {
                                        setItems(prev => prev.filter(i => i.brand_id !== id));
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

export default Brand;