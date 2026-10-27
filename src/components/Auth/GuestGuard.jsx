import { Navigate } from "react-router-dom";

// Blocks the login/register pages for already-authenticated users.
// Sends them to the dashboard that matches their role.
export default function GuestGuard({ children }) {
  const token = localStorage.getItem("token");

  // Not logged in — let them through
  if (!token) {
    return children;
  }

  // Logged in — figure out where they belong
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const primaryRole = roles[0];

  if (primaryRole === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (primaryRole === "Seller") {
    return <Navigate to="/seller/dashboard" replace />;
  }

  if (primaryRole === "Buyer") {
    return <Navigate to="/buyer/dashboard" replace />;
  }

  // Token exists but no role info — stale auth state, clear it and let them log in fresh
  localStorage.removeItem("token");
  localStorage.removeItem("roles");
  return children;
}
