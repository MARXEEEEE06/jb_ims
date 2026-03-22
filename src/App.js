import Login from "./pages/authentication/Login";
import Dashboard from "./pages/overview/Dashboard";
import Inventory from "./pages/inventory/Inventory";
import Products from "./pages/inventory/Products";
// import Brands from "./pages/brands/Brands";
// import Supplier from "./pages/supplier/Supplier";
import StockManagement from "./pages/inventory/StockManagement";
// import Reports from "./pages/Reports/Reports";
import Settings from "./pages/settings/Settings";
import AccountManagement from "./components/Features/settings/AccountManagement";
import Security from "./components/Features/settings/Security";
import AccountDetails from "./components/Features/settings/AccountDetails";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function app(){
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/inventory" element={<Inventory/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/stocks" element={<StockManagement/>} />
        <Route path="/logout" element={<Login />} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/account-management" element={<AccountManagement/>} />

      </Routes>
    </Router>
  )
}

export default app;