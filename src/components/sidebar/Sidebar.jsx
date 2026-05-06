import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/UserAuth.js";
import ConfirmModal from "../features/modals/ConfirmModal.jsx";

import "../../css/Site.css";
import "./Sidebar.css";

import BASE_URL from "../../hooks/server/config.js";
import {
    home, clipboard, box, brand, supplier,
    stock_manage, reports, settings, logout_icon, order
} from "../../assets/ui/Icons";

function Sidebar() {
    const [username, setUsername] = useState("User");
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = String(user?.role ?? "").toLowerCase() === "admin";

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => {
        if (!loading && !user) navigate("/");
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user?.username) setUsername(user.username);
    }, [user?.username]);

    if (loading) return null;

    const navItems = [
        { path: '/dashboard', icon: home, label: 'Dashboard', adminOnly: false },
        { path: '/inventory', icon: clipboard, label: 'Inventory', adminOnly: false },
        { path: '/products', icon: box, label: 'Products', adminOnly: true },
        { path: '/order', icon: order, label: 'Order', adminOnly: true },
        { path: '/brands', icon: brand, label: 'Brands', adminOnly: true },
        { path: '/suppliers', icon: supplier, label: 'Supplier', adminOnly: true },
        { path: '/stocks', icon: stock_manage, label: 'Stock Management', adminOnly: false },
        { path: '/reports', icon: reports, label: 'Report/Logs', adminOnly: false },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <p>Welcome back,</p>
                <h1><strong>{username}</strong></h1>
            </div>

            <div className="sidebar-nav-item">
                {navItems
                    .filter(item => !item.adminOnly || isAdmin)
                    .map(item => (
                    <a 
                        key={item.path}  
                        href={item.path}
                        className={`nav-item nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')} ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <img src={item.icon} alt={item.label} />
                        {item.label}
                    </a>
                    ))
                }
            </div>

            <div className="sidebar-footer">
                {isAdmin && (
                    <a
                        className={`sidebar-footer-item nav-item sidebar-item-settings ${location.pathname === '/settings' ? 'active' : ''}`}
                        href="/settings"
                    >
                        <img src={settings} alt="Settings" />Settings
                    </a>
                )}
                <a
                    className={`sidebar-footer-item nav-item sidebar-item-logout ${showLogoutConfirm ? 'active' : ''}`}
                    onClick={() => setShowLogoutConfirm(true)}
                >
                    <img src={logout_icon} alt="Logout" />Logout
                </a>
            </div>

            {showLogoutConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ConfirmModal
                            message="Are you sure you want to logout?"
                            confirmLabel="Logout"
                            confirmClass="removeProd-btn"
                            onConfirm={handleLogout}
                            onCancel={() => setShowLogoutConfirm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sidebar;