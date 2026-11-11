import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import { getCurrentUser } from "../../services/adminService";

export default function ProtectedLayout() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    if (!token) return undefined;
    const validateSession = () => {
      if (document.visibilityState === "visible") getCurrentUser().catch(() => {});
    };

    validateSession();
    const interval = window.setInterval(validateSession, 15000);
    const handleStorage = (event) => {
      if (event.key === "token" && !event.newValue) window.location.replace("/login");
    };
    window.addEventListener("focus", validateSession);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", validateSession);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", validateSession);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", validateSession);
    };
  }, [token, location.pathname]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <Navbar>
      <Outlet />
    </Navbar>
  );
}
