import { Navigate } from "react-router-dom";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) {
      return false;
    }
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export default function GuestGuard({ children }) {
  const token = localStorage.getItem("token");

  // No token → let them in
  if (!token) {
    return children;
  }

  // Token present but expired / malformed → clear and let them in
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    return children;
  }

  // No initializer — both try and catch assign before use.
  let roles;
  try {
    roles = JSON.parse(localStorage.getItem("roles") || "[]");
  } catch {
    roles = [];
  }

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

  // Token exists but no role info → stale, clear and let them log in fresh
  localStorage.removeItem("token");
  localStorage.removeItem("roles");
  return children;
}
