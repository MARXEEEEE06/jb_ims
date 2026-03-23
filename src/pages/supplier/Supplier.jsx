import HeaderOverview from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";

function Supplier(){
    return(
        <div className="main-container">
            <HeaderOverview />
            <Sidebar />
            <div className="container supplier-container">
                This page is under development.
            </div>
        </div>
    );
}

export default Supplier;