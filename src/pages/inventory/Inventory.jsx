import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import "../../css/Site.css";

function Inventory(){
    const [sku, setSKU] = useState(''); 
    const [product, setProduct] = useState(''); 
    const [brand, setBrand] = useState(''); 
    const [variety, setVariety] = useState(''); 
    const [supplier, setSupplier] = useState(''); 
    const [stock, setStock] = useState(''); 
    const [prod_status, setStatus] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchInventory = async () => {
            try{
                const response = await fetch("http://192.168.254.142:5001/api/inventory",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                });
                const data = await response.json();

                if(response.ok){
                    setItems(Array.isArray(data) ? data : [data]);
                    alert("Items found.");
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

    return(
        <>
            <div className="main-container">
                <HeaderOveriew />
                <Sidebar />
                <div>
                    {items.map((item, idx) => (
                        <div key={idx}>
                            <h2>SKU: {item.SKU}  |  PRODUCT: {item.prod_name}  |  BRAND: {item.brand}  |  VARIETY: {item.variety}  |  SUPPLIER: {item.supplier}  |  STOCK: {item.stock_quantity}  |  STATUS:{item.status} </h2>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Inventory;