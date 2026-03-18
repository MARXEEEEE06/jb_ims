import Layout from "../../components/Layout.jsx";
import Histogram from "../../components/charts/Histogram.jsx";
import "./Dashboard.css";
import "../../css/Site.css";
import favicon from "../../assets/ui/favicon.png";

function Dashboard(){
    const sampleData = [1,1,1,2,2,2,3,3,3,4,4,4,5,5,5];
    
    return(
        <>
            <div className="container">
                <div className="header">
                    <p>Overview</p>
                    <img src={favicon} />
                </div>
                <Layout />
                <div className="overview">
                    <div className="charts charts-histogram">
                        <Histogram dataArray={sampleData}/>
                    </div>
                    <p>
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                        Dignissimos modi veniam hic suscipit repudiandae.
                        Repellat dignissimos ad molestias neque excepturi.
                    </p>
                </div>
            </div>
        </>
    );
}

export default Dashboard;