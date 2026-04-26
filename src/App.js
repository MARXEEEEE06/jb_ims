import Login from "./pages/authentication/Login.jsx";
import Dashboard from "./pages/overview/Dashboard.jsx";
import Inventory from "./pages/inventory/Inventory.jsx";
import Products from "./pages/inventory/Products.jsx";
import Order from './pages/orders/Order.jsx.jsx';
import Brands from "./pages/brands/Brands.jsx";
import Suppliers from "./pages/supplier/Supplier.jsx";
import StockManagement from "./pages/inventory/StockManagement.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Settings from "./pages/settings/Settings.jsx";
import AccountManagement from "./components/features/settings/AccountManagement.jsx.jsx";
import Security from "./components/features/settings/Security.jsx";
import AccountDetails from "./components/features/settings/AccountDetails.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function app(){
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/inventory" element={<Inventory/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/order" element={<Order />} />
        <Route path="/brands" element={<Brands/>} />
        <Route path="/suppliers" element={<Suppliers/>} />
        <Route path="/stocks" element={<StockManagement/>} />
        <Route path="/reports" element={<Reports/>} />
        <Route path="/logout" element={<Login />} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/account-management" element={<AccountManagement/>} />

      </Routes>
    </Router>
  )
}

export default app;