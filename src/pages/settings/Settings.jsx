import "../../css/Site.css";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";

function Settings(){
    return(
        <div className="main-container">
            <HeaderOveriew />
            <Sidebar />
        </div>
    );
}

export default Settings;