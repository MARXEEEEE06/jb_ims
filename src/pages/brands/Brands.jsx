import HeaderOverview from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";

function Brands(){
    return(
        <div className="main-container">
            <HeaderOverview />
            <Sidebar />
            <div className="container brands-container">
                This page is under development.
            </div>
        </div>
    );
}

export default Brands;