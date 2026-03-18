import "./Sidebar.css";
import navicon_fallback from "../../assets/test/TemplateGrid_albedo.png";
import avatar_fallback from "../../assets/ui/avatar-placeholder.jpg";

function Sidebar(){
    return(
        <div className="sidebar">
            <div className="sidebar-header">
                <img src={avatar_fallback} />
                <p>Welcome back, <strong>Juan Dela Cruz</strong></p>
            </div>
            <div className="sidebar-nav-item">
                <span className="nav-item nav-item-dashboard">
                    <a href='/dashboard'><img src={navicon_fallback} />Dashboard</a>
                </span>
                <span className="nav-item nav-item-inventory">
                    <img src={navicon_fallback} />Inventory
                </span>
                <span className="nav-item nav-item-products">
                    <img src={navicon_fallback} />Products
                </span>
                <span className="nav-item nav-item-brands">
                    <img src={navicon_fallback} />Brands
                </span>
                <span className="nav-item nav-item-supplier">
                    <img src={navicon_fallback} />Supplier
                </span>
                <span className="nav-item nav-item-stock">
                    <img src={navicon_fallback} />Stock Management
                </span>
                <span className="nav-item nav-item-reports">
                    <img src={navicon_fallback} />Report/Logs
                </span>
            </div>
            <div className="sidebar-footer">
                <a className="sidebar-footer-item sidebar-item-settings">Settings</a>
                <a className="sidebar-footer-item sidebar-item-logout">Logout</a>
            </div>
        </div>
    )
}

export default Sidebar;