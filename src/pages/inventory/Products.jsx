import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import AddProduct from "../../components/features/inventory/AddProduct.jsx";
import EditProduct from "../../components/features/inventory/EditProduct.jsx";
import RemoveProduct from '../../components/features/inventory/RemoveModal.jsx';
import "../../css/Site.css";
import "./Products.css";
import { 
    plus,
    pencil,
    trashbin
} from "../../assets/ui/Icons.js";

function Products(){
    const [sku, setSKU] = useState(''); 
    const [product, setProduct] = useState(''); 
    const [brand, setBrand] = useState(''); 
    const [variety, setVariety] = useState(''); 
    const [supplier, setSupplier] = useState(''); 
    const [stock, setStock] = useState(''); 
    const [prod_status, setStatus] = useState('');
    const [items, setItems] = useState([]);

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState(null);

    const handleEdit = (item) => {
        setSelectedItem(item);
    };

    const handleRemoveProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to remove this product?")) return;

        try {
            const response = await fetch(`http://192.168.254.142:5000/api/removeproduct/${productId}`, {
            method: "DELETE",
            });

            const data = await response.json();
            if (response.ok) {
            alert("Product removed successfully");
            setItems(prev => prev.filter(item => item.product_id !== productId)); // remove from UI
            } else {
            alert(data.error || "Failed to remove product");
            }
        } catch (error) {
            alert("Server error");
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await fetch("http://192.168.254.142:5000/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                alert(data.error);
            }
        } catch (error) {
            alert("Server Error");
        }
    };

    useEffect(() => {
        fetchInventory(); // still runs on mount
    }, []);

    function getStatus(stock) {
        if (stock === 0) return 'OUT OF STOCK';
        if (stock < 10) return 'CRITICAL';
        if (stock < 20) return 'LOW';
        return 'IN-STOCK';
    }

    return(
        <>
            <div className="main-container">
                <HeaderOveriew />
                <Sidebar />
                <div className="container products-container">
                    <div className="products-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>PRODUCT</th>
                                    <th>BRAND</th>
                                    <th>VARIETY</th>
                                    <th>SUPPLIER</th>
                                    <th>PRICE</th>
                                    <th>TYPE</th>
                                    <th>CATEGORY</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="products-tbody">
                            {items.map((item) => {
                                const isSelected = selectedItem?.product_id === item.product_id;

                                return (
                                <tr
                                    key={item.product_id}
                                    onClick={() =>
                                    setSelectedItem(prev =>
                                        prev?.product_id === item.product_id ? null : item
                                    )}
                                    style={{
                                    backgroundColor: isSelected ? '#ddd' : ''
                                    }}
                                >
                                    <td>{item.SKU}</td>
                                    <td>{item.prod_name}</td>
                                    <td>{item.brand}</td>
                                    <td>{item.variety}</td>
                                    <td>{item.supplier}</td>
                                    <td>{item.price}</td>
                                    <td>{item.unit_type}</td>
                                    <td>{item.category}</td>
                                    <td className="product-status">{item.status}</td>
                                </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className="product-actions-button">
                        <button className="addProd-btn" onClick={() => setShowAdd(true)}><img src={plus}/> Add Product</button>
                        <button
                            className="editProd-btn"
                            onClick={() => {
                                if (!selectedItem) {
                                alert("Select a product first");
                                return;
                                }
                                setShowEdit(true);
                        }}>
                            <img src={pencil}/> Edit Product
                        </button>
                        <button 
                            className="removeProd-btn" 
                                onClick={() => {
                                if (!selectedItem) {
                                alert("Select a product first");
                                return;
                                }
                                setShowRemove(true);
                            }}>
                            <img src={trashbin}/> 
                            Remove Product</button>
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
                                    onRefresh={fetchInventory} />
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
                </div>
            </div>
        </>
    );
}

export default Products;