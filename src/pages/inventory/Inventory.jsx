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
    const [isloading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInventory = async () => {
            try{
                setIsLoading(true);
                const response = await fetch("http://192.168.254.142:5000/api/inventory",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                });
                const data = await response.json();

                if(response.ok){
                    setIsLoading(false);
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

    return(
        <>
            <div className="main-container">
                <HeaderOveriew />
                <Sidebar />
                <div className="item-table">
                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>PRODUCT</th>
                                <th>BRAND</th>
                                <th>VARIETY</th>
                                <th>SUPPLIER</th>
                                <th>STOCK</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (

                                <tr key={idx}>
                                    <td>{item.SKU}</td>
                                    <td>{item.prod_name}</td>
                                    <td>{item.brand}</td>
                                    <td>{item.variety}</td>
                                    <td>{item.supplier}</td>
                                    <td>{item.stock_quantity}</td>
                                    <td>{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Inventory;