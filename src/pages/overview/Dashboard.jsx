import React from "react";
import Histogram from "../../components/charts/Histogram.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import { supplyDemandData } from "../../hooks/data/data.js";
import "./Dashboard.css";
import "../../css/Site.css";
import { 
    products_box,
    supplier2,
    low_stock
} from "../../assets/ui/Icons";
import "../../css/Site.css";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";

function Dashboard(){
    // const sampleData = [1,2,3,4,5];
    return(
        <>
        <title>Dashboard</title>
            <div className="main-container dashboard-container">
                <HeaderOveriew />
                <Sidebar />
                <div className="overview">
                    <div className="card card-data data-card-products">
                        <img src={products_box} alt={products_box}/>
                        <h1>Total Products</h1>
                        <p>67</p>
                    </div>
                    <div className="card card-data card-data-suppliers">
                        <img src={supplier2} alt={supplier2}/>
                        <h1>Total Suppliers</h1>
                        <p>67</p>
                    </div>
                    <div className="card card-data card-data-stock">
                        <img src={low_stock} alt={low_stock}/>
                        <h1>Stock Alerts</h1>
                        <p>67</p>
                    </div>
                    <div className="charts charts-histogram">
                        <Histogram data={supplyDemandData}/>
                    </div>
                    <div className="charts charts-bar1">
                        <BarChart data={supplyDemandData} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;