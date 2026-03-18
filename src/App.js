import Login from "./pages/authentication/Login";
import Overview from "./pages/overview/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function app(){
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Overview />} />

      </Routes>
    </Router>
  )
}

export default app;