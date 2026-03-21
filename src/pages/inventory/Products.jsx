import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import AddProduct from "../../components/Features/AddProduct.jsx";
import EditProduct from "../../components/Features/EditProduct.jsx";
import "../../css/Site.css";
import "./Products.css";
import { 
    plus,
    pencil,
    trashbin
} from "../../assets/ui/Icons.js";

function Inventory(){
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
    
    const [selectedItem, setSelectedItem] = useState(null);

    const handleEdit = (item) => {
        setSelectedItem(item);
    };

    useEffect(() => {
        const fetchInventory = async () => {
            try{
                const response = await fetch("http://192.168.254.142:5000/api/inventory",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                });
                const data = await response.json();

                if(response.ok){
                    setItems(Array.isArray(data) ? data : [data]);
                    // alert("Items found.");
                }
                else{
                    alert(data.error);
                }
            }catch(error){
                alert("Server Error")
            }
        }
        fetchInventory();
    },[]);

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
                <div className="products-container">
                    <div className="item-table">
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
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr
                                        key={item.product_id}
                                        onClick={() => setSelectedItem(item)}
                                        style={{
                                            backgroundColor: selectedItem?.product_id === item.product_id ? '#ddd' : ''
                                        }}
                                    >
                                        <td>{item.SKU}</td>
                                        <td>{item.prod_name}</td>
                                        <td>{item.brand}</td>
                                        <td>{item.variety}</td>
                                        <td>{item.supplier}</td>
                                        <td>{item.price}</td>
                                        <td>{item.type}</td>
                                        <td>{item.category}</td>
                                        <td>{item.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="actions-button">
                        <button onClick={() => setShowAdd(true)}><img src={plus}/>Add Product</button>
                        <button
                            onClick={() => {
                                if (!selectedItem) {
                                alert("Select a product first");
                                return;
                                }
                                setShowEdit(true);
                        }}>
                            <img src={pencil}/>Edit Product
                        </button>
                        <button><img src={trashbin}/>Remove Product</button>
                    </div>
                    {showAdd && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <AddProduct onClose={() => setShowAdd(false)} />
                            </div>
                        </div>
                    )}
                    {showEdit && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <EditProduct 
                                    item={selectedItem}
                                    onClose={() => setShowEdit(false)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Inventory;