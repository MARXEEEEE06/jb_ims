import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import HeaderOveriew from "../../components/header/Header.jsx";
import AccountDetails from "../../components/features/settings/AccountDetails.jsx";
import Security from "../../components/features/settings/Security.jsx";
import AccountManagement from "../../components/features/settings/AccountManagement.jsx";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("account-details");
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "account-details":
        return <AccountDetails />;
      case "security":
        return <Security />;
      case "account-management":
        return <AccountManagement />;
      default:
        return <AccountDetails />;
    }
  };

  return (
    <div className="main-container">
      <HeaderOveriew />
      <Sidebar />
      <div>
        <div className="container settings-container">
            <button
            className="settings-btn acc-det"
            onClick={() => setActiveTab("account-details")}>
            Account Details
            </button>
            <button
            className="settings-btn security"
            onClick={() => setActiveTab("security")}>
            Security
            </button>
            {role === "Admin" && (
              <button
                className="settings-btn acc-manage"
                onClick={() => setActiveTab("account-management")}
              >
                Account Management
              </button>
            )}
        </div>
        <div className="settings-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Settings;