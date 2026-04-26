import React from "react";
import { favicon } from "../../assets/ui/Icons";
import "./Header.css";

function HeaderOverview({ items, field, keyword, setKeyword }) {
    const headerTitles = {
        "/dashboard": "Dashboard",
        "/inventory": "Inventory",
        "/products": "Products",
        "/orders": "Order",
        "/brands": "Brands",
        "/suppliers": "Supplier",
        "/stocks": "Stock Management",
        "/reports": "Reports/Logs",
        "/settings": "Settings",
        "/account-details": "Account Details",
        "/security": "Security",
        "/account-management": "Account Management",
    };

    const pathname = window.location.pathname;
    const headerTitle = headerTitles[pathname] || "Page";
    const hideSearchOn = ["/dashboard", "/settings", "/suppliers"];
    const showSearch = !hideSearchOn.includes(pathname);

    return (
        <div className="header">
            <p className="header-title">{headerTitle}</p>
            {showSearch && (
                <input
                    className="input-search"
                    type="text"
                    placeholder="Search bar"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            )}
            <img className="header-icon" src={favicon} alt="favicon" />
        </div>
    );
}

export default HeaderOverview;