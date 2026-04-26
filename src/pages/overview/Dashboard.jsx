import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Histogram from "../../components/charts/Histogram.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import useAuth from "../../hooks/UserAuth.js";
import BASE_URL from "../../hooks/server/config.js";
import "./Dashboard.css";
import "../../css/Site.css";
import { 
    products_box,
    supplier2,
    low_stock
} from "../../assets/ui/Icons";

function Dashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        total_products: 0,
        total_suppliers: 0,
        low_stock: 0,
    });

    useEffect(() => {
    console.log("loading:", loading, "user:", user);
    if (!loading && !user) {
        alert("You must be logged in to access this page.");
        navigate("/");
    }
}, [user, loading, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
        try {
            const res = await fetch(`${BASE_URL}/getprodcount`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
        };

        fetchStats();
    }, []);

    if (loading) return null; // ✅ render nothing while checking

    return(
        <div className="main-container">
            <HeaderOveriew />
            <Sidebar />
            <div className="container dashboard-container">
                <div className="card card-data data-card-products">
                    <img src={products_box} alt={products_box}/>
                    <h1>Total Products</h1>
                    <p>{stats.total_products}</p>
                </div>
                <div className="card card-data card-data-suppliers">
                    <img src={supplier2} alt={supplier2}/>
                    <h1>Total Suppliers</h1>
                    <p>{stats.total_suppliers}</p>
                </div>
                <div className="card card-data card-data-stock">
                    <img src={low_stock} alt={low_stock}/>
                    <h1>Stock Alerts</h1>
                    <p>{stats.low_stock}</p>
                </div>
                <div className="charts charts-histogram">
                    <Histogram />
                </div>
                <div className="charts charts-bar1">
                    <BarChart />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
