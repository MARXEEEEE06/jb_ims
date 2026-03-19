import React from "react";
import Layout from "../../components/Layout.jsx";
import Histogram from "../../components/charts/Histogram.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import { supplyDemandData } from "../../hooks/data/data.js";
import "./Dashboard.css";
import "../../css/Site.css";
import favicon from "../../assets/ui/favicon.png";
import { 
    products_box,
    supplier2,
    low_stock
} from "../../assets/ui/Icons";

function Dashboard(){
    // const sampleData = [1,2,3,4,5];
    return(
        <>
        <title>Dashboard</title>
            <div className="dashboard-container">
                <div className="header">
                    <p className="header-title">Overview</p>
                    <input className="input-search" type="text" value="Search bar"></input>
                    <img className="header-icon" src={favicon} />
                </div>
                <Layout />
                <div className="overview">
                    <div className="card card-data data-card-products">
                        <img src={products_box} />
                        <h1>Total Products</h1>
                        <p>67</p>
                    </div>
                    <div className="card card-data card-data-suppliers">
                        <img src={supplier2} />
                        <h1>Total Suppliers</h1>
                        <p>67</p>
                    </div>
                    <div className="card card-data card-data-stock">
                        <img src={low_stock} />
                        <h1>Stock Alerts</h1>
                        <p>67</p>
                    </div>
                    <div className="charts charts-histogram">
                        <Histogram data={supplyDemandData}/>
                    </div>
                    <div className="charts charts-bar1">
                        <BarChart data={supplyDemandData} />
                    </div>
                    <p>
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                        Dignissimos modi veniam hic suscipit repudiandae.
                        Repellat dignissimos ad molestias neque excepturi.
                    </p>
                </div>
            </div>
        </>
    );
}

export default Dashboard;