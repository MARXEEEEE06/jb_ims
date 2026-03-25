import { useState, useEffect } from "react";
import BASE_URL from "../../hooks/server/config";
import getStatusClass from "../../hooks/inventory/GetStatus";
import HeaderOveriew from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import "./StockManagement.css";

function StockManagement(){
    const [items, setItems] = useState([]);

    const handleStockChange = async (productId, adjustment) => {
        console.log("productId:", productId, "adjustment:", adjustment); // ✅
        try {
            const response = await fetch(`${BASE_URL}/stock/${productId}`, {
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
            const response = await fetch(`${BASE_URL}/inventory`, {
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

    getStatusClass();

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
                            <td>
                                <div className={`status-container ${getStatusClass(item.stock_quantity)}`}>
                                    {item.status}
                                </div>
                            </td>
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