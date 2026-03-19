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
                    <a href='/dashboard'><img src={home} />Dashboard</a>
                </span>
                <span className="nav-item nav-item-inventory">
                    <img src={clipboard} />Inventory
                </span>
                <span className="nav-item nav-item-products">
                    <img src={box} />Products
                </span>
                <span className="nav-item nav-item-brands">
                    <img src={brand} />Brands
                </span>
                <span className="nav-item nav-item-supplier">
                    <img src={supplier} />Supplier
                </span>
                <span className="nav-item nav-item-stock">
                    <img src={stock_manage} />Stock Management
                </span>
                <span className="nav-item nav-item-reports">
                    <img src={reports} />Report/Logs
                </span>
            </div>
            <div className="sidebar-footer">
                <a className="sidebar-footer-item sidebar-item-settings"><img src={settings}/>Settings</a>
                <a className="sidebar-footer-item sidebar-item-logout"><img src={logout} />Logout</a>
            </div>
        </div>
    )
}

export default Sidebar;