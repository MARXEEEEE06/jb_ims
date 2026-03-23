import HeaderOverview from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";

function Logs(){
    return(
        <div className="main-container">
            <HeaderOverview />
            <Sidebar />
            <div className="container reports-container">
                This page is under development.
            </div>
        </div>
    );
}

export default Logs;