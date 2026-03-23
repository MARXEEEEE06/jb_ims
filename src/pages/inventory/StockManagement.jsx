import { useState, useEffect } from "react";
import HeaderOveriew from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import "./StockManagement.css";

function StockManagement(){
    const [items, setItems] = useState([]);

    const handleStockChange = async (productId, adjustment) => {
        console.log("productId:", productId, "adjustment:", adjustment); // ✅
        try {
            const response = await fetch(`http://192.168.254.142:5000/api/stock/${productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adjustment })
            });

            const data = await response.json();
            console.log("Response:", data); // ✅
            
            if (response.ok) {
                fetchInventory();
            } else {
                alert(data.error);
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
                setItems(Array.isArray(data) ? data : [data]);
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

    return(
        <div className="main-container">
            <HeaderOveriew />
            <Sidebar />
            <div className="container stocks-container">
                <table>
                    <thead>
                        <tr>
                            <th>ITEMS</th>
                            <th>TYPE</th>
                            <th>QUANTITY</th>
                            <th>UNIT TYPE</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                    {items.map((item) => {
                        return (
                        <tr key={item.product_id}>
                            <td>{item.prod_name}</td>
                            <td>{item.variety}</td>
                            <td>
                                <button 
                                className="stock-minus-btn"
                                onClick={() => handleStockChange(item.product_id, -1)}>-</button>
                                {item.stock_quantity}
                                <button
                                className="stock-add-btn"
                                onClick={() => handleStockChange(item.product_id, +1)}>+</button>
                            </td>
                            <td>{item.unit_type}</td>
                            <td className="product-status">{item.status}</td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StockManagement;