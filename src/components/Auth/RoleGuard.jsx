import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/authApi";

// Blocks users whose role doesn't match what the route allows.
// Can be used as a wrapper (<RoleGuard>...</RoleGuard>) or as a layout route.
export default function RoleGuard({ allowedRoles = [], children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const res = await getCurrentUser();
        const user = res.data;
        const roles = user?.account?.roles || user?.roles || [];
        setIsLoggedIn(true);
        const hasAccess = Array.isArray(roles) && roles.some((r) => allowedRoles.includes(r));
        setAuthorized(hasAccess);
      } catch (err) {
        console.error("Role check failed:", err);
        setIsLoggedIn(false);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Checking permissions...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!authorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
