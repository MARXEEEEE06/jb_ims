import Login from "./pages/authentication/Login";
import Overview from "./pages/overview/Dashboard";
import Inventory from "./pages/inventory/Inventory";
// import Products from "./pages/products/Products";
// import Brands from "./pages/brands/Brands";
// import Supplier from "./pages/supplier/Supplier";
// import Stock from "./pages/stock_management/Stock_Management";
// import Reports from "./pages/Reports/Reports";
import Settings from "./pages/settings/Settings";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function app(){
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/settings" element={<Settings title="Settings"/>} />
        <Route path="/logout" element={<Login />} />

      </Routes>
    </Router>
  )
}

export default app;