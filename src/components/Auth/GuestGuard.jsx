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
    localStorage.removeItem("tokenExpiresInMinutes");
    localStorage.removeItem("profileSetupRequired");
    return children;
  }

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

  // Authenticated but has no application role: onboarding is incomplete.
  // Send them to profile setup instead of showing login/register again.
  if (localStorage.getItem("profileSetupRequired") === "true" || roles.length === 0) {
    return <Navigate to="/setup-profile" replace />;
  }

  // Token exists but no role info → stale, clear and let them log in fresh
  localStorage.removeItem("token");
  localStorage.removeItem("roles");
  localStorage.removeItem("tokenExpiresInMinutes");
  localStorage.removeItem("profileSetupRequired");
  return children;
}
