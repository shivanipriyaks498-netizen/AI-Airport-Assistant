
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ adminOnly = false }) {
  const token = sessionStorage.getItem("token");

  const storedUser = sessionStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
