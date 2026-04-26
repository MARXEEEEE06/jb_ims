import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/UserAuth";
import "../../css/Site.css";
import "./Sidebar.css";
import {
    home,
    clipboard,
    box,
    brand,
    supplier,
    stock_manage,
    reports,
    settings,
    logout_icon,
    order
} from "../../assets/ui/Icons";

function Sidebar() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("User");

    useEffect(() => {
        if (!loading && !user) navigate("/");
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user?.username) setUsername(user.username);
    }, [user?.username]);

    if (loading) return null;

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <p>Welcome back,</p>
                <h1><strong>{username}</strong></h1>
            </div>

            <div className="sidebar-nav-item">
                <span className="nav-item nav-item-dashboard">
                    <a href='/dashboard'><img src={home} alt="Dashboard" />Dashboard</a>
                </span>

                <span className="nav-item nav-item-inventory">
                    <a href='/inventory'><img src={clipboard} alt="Inventory" />Inventory</a>
                </span>

                <span className="nav-item nav-item-products">
                    <a href='/products'><img src={box} alt="Products" />Products</a>
                </span>

                <span className="nav-item nav-item-order">
                    <a href='/order'><img src={order} alt="Order" />Order</a>
                </span>

                <span className="nav-item nav-item-brands">
                    <a href='/brands'><img src={brand} alt="Brands" />Brands</a>
                </span>

                <span className="nav-item nav-item-supplier">
                    <a href='/suppliers'><img src={supplier} alt="Supplier" />Supplier</a>
                </span>

                <span className="nav-item nav-item-stock">
                    <a href='/stocks'><img src={stock_manage} alt="Stock Management" />Stock Management</a>
                </span>

                <span className="nav-item nav-item-reports">
                    <a href='/reports'><img src={reports} alt="Report/Logs" />Report/Logs</a>
                </span>
            </div>

            <div className="sidebar-footer">
                <a className="sidebar-footer-item nav-item sidebar-item-settings" href="/settings">
                    <img src={settings} alt="Settings" />Settings
                </a>

                <a
                    className="sidebar-footer-item nav-item sidebar-item-logout"
                    onClick={() => localStorage.removeItem("token")}
                    href="/"
                >
                    <img src={logout_icon} alt="Logout" />Logout
                </a>
            </div>
        </div>
    );
}

export default Sidebar;
