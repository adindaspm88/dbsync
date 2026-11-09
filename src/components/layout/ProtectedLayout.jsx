import {
  Navigate,
  Outlet,
} from "react-router-dom";

import Navbar from "./Navbar";

export default function ProtectedLayout() {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  return (
    <Navbar>
      <Outlet />
    </Navbar>
  );
}
