import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/UserAuth";
import Sidebar from "../sidebar/Sidebar";

const STAFF_ALLOWED_PATHS = new Set([
  "/inventory",
  "/order",
  "/stocks",
]);

function NoAccess() {
  return (
    <div className="main-container">
      <div className="header" />
      <Sidebar />
      <div className="container">
        <div style={{ fontSize: 18, fontWeight: 600 }}>You have no access to this page.</div>
      </div>
    </div>
  );
}

function RequireAccess({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname }} />;

  const role = String(user.role ?? "").toLowerCase();
  if (role === "staff" && !STAFF_ALLOWED_PATHS.has(location.pathname)) {
    return <NoAccess />;
  }

  return children;
}

export default RequireAccess;
