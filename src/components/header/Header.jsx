import { useLocation } from "react-router-dom";
import "../../css/Site.css"
import "./Header.css";
import { favicon } from "../../assets/ui/Icons";

function HeaderOveriew(){
    const location = useLocation();
    const hideSearchOn = ["/dashboard", "/settings"]; 
    const showSearch = !hideSearchOn.includes(location.pathname);
    
    const headerTitles = {
        "/dashboard": "Dashboard",
        "/inventory": "Inventory",
        "/products": "Products",
        "/brands": "Brands",
        "/supplier": "supplier",
        "/stocks": "Stock Management",
        "/reports": "Reports/Logs",
        "/settings": "Settings",
    }

    const headerTitle = headerTitles[location.pathname] || "Page";
    return(
        <div className="header">
            <p className="header-title">{headerTitle}</p>
            {showSearch && (
                <input className="input-search" 
                type="text" 
                placeholder="Search bar" />
            )}
            <img className="header-icon" src={favicon} alt={favicon}/>
        </div>
    )
}

export default HeaderOveriew;