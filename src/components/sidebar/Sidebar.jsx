import "../../css/Site.css"
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
    logout
} from "../../assets/ui/Icons";

function Sidebar(){
    return(
        <div className="sidebar">
            <div className="sidebar-header">
                <p>Welcome back, <h1><strong>Juan Dela Cruz</strong></h1></p>
            </div>
            <div className="sidebar-nav-item">
                <span className="nav-item nav-item-dashboard">
                    <a href='/dashboard'><img src={home} alt={home}/>Dashboard</a>
                </span>
                <span className="nav-item nav-item-inventory">
                    <a href='/inventory'><img src={clipboard} alt={clipboard}/>Inventory</a>
                </span>
                <span className="nav-item nav-item-products">
                    <a href='/products'><img src={box} alt={box}/>Products</a>
                </span>
                <span className="nav-item nav-item-brands">
                    <a href='/brands'><img src={brand} alt={brand}/>Brands</a>
                </span>
                <span className="nav-item nav-item-supplier">
                    <a href='/supplier'><img src={supplier} alt={supplier}/>Supplier</a>
                </span>
                <span className="nav-item nav-item-stock">
                    <a href='/stocks'><img src={stock_manage} alt={stock_manage}/>Stock Management</a>
                </span>
                <span className="nav-item nav-item-reports">
                    <a href='/reports'><img src={reports} alt={reports}/>Report/Logs</a>
                </span>
            </div>
            <div className="sidebar-footer">
                <a className="sidebar-footer-item nav-item sidebar-item-settings" href="/settings"><img src={settings} alt={settings}/>Settings</a>
                <a className="sidebar-footer-item nav-item sidebar-item-logout" href="/"><img src={logout} alt={logout}/>Logout</a>
            </div>
        </div>
    )
}

export default Sidebar;