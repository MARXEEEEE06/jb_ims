import Login from "./pages/authentication/Login";
import Dashboard from "./pages/overview/Dashboard";
import Inventory from "./pages/inventory/Inventory";
import Products from "./pages/inventory/Products";
import Order from './pages/orders/Order.jsx';
import Brands from "./pages/brands/Brands";
import Suppliers from "./pages/supplier/Supplier";
import StockManagement from "./pages/inventory/StockManagement";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import AccountManagement from "./components/features/settings/AccountManagement.jsx";
import Security from "./components/features/settings/Security";
import AccountDetails from "./components/features/settings/AccountDetails";

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