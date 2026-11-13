import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../../services/authApi";
import AuctionLoader from "../AuctionLoader";

export default function RoleGuard({
  allowedRoles = [],
  allowStaff = false,
  children,
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Stable dependency: serialize the roles array so new array literals
  // from the caller don't cause the effect to re-run every render.
  const rolesKey = useMemo(
    () => [...allowedRoles].sort().join("|"),
    [allowedRoles],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (mounted) {
          setIsLoggedIn(false);
          setAuthorized(false);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await getCurrentUser();
        if (!mounted) {
          return;
        }

        const user = res.data?.data;
        const roles = user?.account?.roles || user?.roles || [];
        const roleList = Array.isArray(roles) ? roles : [];

        setIsLoggedIn(true);

        const isStaff = roleList.some(
          (r) => r === "Admin" || !["Buyer", "Seller"].includes(r),
        );

        const hasAccess =
          roleList.some((r) => allowedRoles.includes(r)) ||
          (allowStaff && isStaff);

        setAuthorized(hasAccess);
      } catch (err) {
        console.error("Role check failed:", err);
        if (mounted) {
          setIsLoggedIn(false);
          setAuthorized(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
    // rolesKey covers the array; allowedRoles is read from the closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesKey, allowStaff]);

  if (loading) {
    return <AuctionLoader />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (!authorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
