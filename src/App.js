import Login from "./pages/authentication/Login.jsx";
import Dashboard from "./pages/overview/Dashboard.jsx";
import Inventory from "./pages/inventory/Inventory.jsx";
import Products from "./pages/inventory/Products.jsx";
import Order from './pages/orders/Order.jsx';
import Brands from "./pages/brands/Brands.jsx";
import Suppliers from "./pages/supplier/Supplier.jsx";
import StockManagement from "./pages/inventory/StockManagement.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Settings from "./pages/settings/Settings.jsx";
import AccountManagement from "./components/features/settings/AccountManagement.jsx";
import Security from "./components/features/settings/Security.jsx";
import AccountDetails from "./components/features/settings/AccountDetails.jsx";
import RequireAccess from "./components/auth/RequireAccess.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function app(){
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<RequireAccess><Dashboard/></RequireAccess>} />
        <Route path="/inventory" element={<RequireAccess><Inventory/></RequireAccess>} />
        <Route path="/products" element={<RequireAccess><Products/></RequireAccess>} />
        <Route path="/order" element={<RequireAccess><Order /></RequireAccess>} />
        <Route path="/brands" element={<RequireAccess><Brands/></RequireAccess>} />
        <Route path="/suppliers" element={<RequireAccess><Suppliers/></RequireAccess>} />
        <Route path="/stocks" element={<RequireAccess><StockManagement/></RequireAccess>} />
        <Route path="/reports" element={<RequireAccess><Reports/></RequireAccess>} />
        <Route path="/logout" element={<Login />} />
        <Route path="/settings" element={<RequireAccess><Settings/></RequireAccess>} />
        <Route path="/account-management" element={<RequireAccess><AccountManagement/></RequireAccess>} />
      </Routes>
    </Router>
  )
}

export default app;
