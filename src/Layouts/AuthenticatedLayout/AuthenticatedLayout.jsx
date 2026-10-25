import { useEffect, useState } from "react";
import {
  Outlet,
  NavLink,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  Gavel,
  Wallet,
  Settings,
  ArrowLeft,
  LogOut,
  Bell,
  Settings2,
  Package,
  Users,
  ShieldCheck,
  CreditCard,
  Scale,
  CheckCircle,
  Trophy,
  ShoppingCart,
} from "lucide-react";
import authApi, {
  logout,
  getCurrentUser,
  getAuthConfig,
} from "../../services/authApi";

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getCurrentUser();
        setUserData(userRes.data);

        const currentRole = userRes.data?.account?.roles?.[0];

        if (currentRole !== "Admin") {
          try {
            const walletRes = await authApi.get("/wallet/me", getAuthConfig());
            setBalance(walletRes.data.data.balance || 0);
          } catch (walletErr) {
            console.warn(
              "Wallet not found or could not be fetched:",
              walletErr,
            );
            setBalance(0);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading your workspace...
      </div>
    );
  }

  const role = userData?.account?.roles?.[0] || "User";
  const currentDate =
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " (Local)";

  // Determine the path for the main dashboard link based on role
  const dashboardLink = role === "Admin" ? "/admin" : "/dashboard";

  // Generate a human-readable label for the current page
  const getBreadcrumbLabel = () => {
    const path = location.pathname;
    const labels = {
      "/dashboard": "Buyer Dashboard",
      "/seller-dashboard": "Seller Dashboard",
      "/admin": "Admin Dashboard",
      "/admin/users": "User Management",
      "/admin/products": "Product Moderation",
      "/admin/deposits": "Deposit Requests",
      "/admin/verifications": "Profile Verifications",
      "/admin/auctions": "Auctions",
      "/admin/disputes": "Disputes",
      "/admin/categories": "Categories",
    };
    return labels[path] || (role === "Admin" ? "Admin account" : "Dashboard");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-md text-white">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Bidora
              </span>
            </Link>
          </div>

          {/* Dynamic Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Overview
              </p>
              <nav className="space-y-1">
                <NavLink to={dashboardLink} end className={navLinkClass}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </NavLink>
                {/* Inside AuthenticatedLayout.jsx, replace the Buyer/Seller
                blocks with this: */}
                {role === "Buyer" && (
                  <>
                    <NavLink to="/buyer/bids" className={navLinkClass}>
                      <Gavel className="w-4 h-4" /> My bids
                    </NavLink>
                    <NavLink to="/buyer/won" className={navLinkClass}>
                      <Trophy className="w-4 h-4" /> Won Auctions
                    </NavLink>
                    <NavLink to="/wallet" className={navLinkClass}>
                      <Wallet className="w-4 h-4" /> My wallet
                    </NavLink>
                  </>
                )}
                {role === "Seller" && (
                  <>
                    <NavLink to="/seller/products" className={navLinkClass}>
                      <Package className="w-4 h-4" /> My products
                    </NavLink>
                    <NavLink to="/seller/sales" className={navLinkClass}>
                      <ShoppingCart className="w-4 h-4" /> My sales
                    </NavLink>
                    <NavLink to="/wallet" className={navLinkClass}>
                      <Wallet className="w-4 h-4" /> My wallet
                    </NavLink>
                  </>
                )}
                {role === "Admin" && (
                  <>
                    <NavLink to="/admin/users" className={navLinkClass}>
                      <Users className="w-4 h-4" /> User Management
                    </NavLink>
                    <NavLink to="/admin/products" className={navLinkClass}>
                      <ShieldCheck className="w-4 h-4" /> Product Moderation
                    </NavLink>
                    <NavLink to="/admin/deposits" className={navLinkClass}>
                      <CreditCard className="w-4 h-4" /> Deposit Requests
                    </NavLink>
                    <NavLink to="/admin/verifications" className={navLinkClass}>
                      <CheckCircle className="w-4 h-4" /> Profile Verifications
                    </NavLink>
                    <NavLink to="/admin/auctions" className={navLinkClass}>
                      <Gavel className="w-4 h-4" /> Auctions
                    </NavLink>
                    <NavLink to="/admin/disputes" className={navLinkClass}>
                      <Scale className="w-4 h-4" /> Disputes
                    </NavLink>
                    <NavLink to="/admin/categories" className={navLinkClass}>
                      <LayoutDashboard className="w-4 h-4" /> Categories
                    </NavLink>
                  </>
                )}
                {role !== "Admin" && (
                  <NavLink to="/wallet" className={navLinkClass}>
                    <Wallet className="w-4 h-4" /> My wallet
                  </NavLink>
                )}
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Activity
              </p>
              <nav className="space-y-1">
                <NavLink to="/settings" className={navLinkClass}>
                  <Settings className="w-4 h-4" /> Account settings
                </NavLink>
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Explore
              </p>
              <nav className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to marketplace
                </Link>
              </nav>
            </div>
          </div>

          {/* Logout - pinned to bottom */}
          <div className="border-t border-gray-100 p-3 shrink-0 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-5">
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer">
              Marketplace
            </span>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">
              {getBreadcrumbLabel()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{currentDate}</span>

            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Settings2 className="w-4 h-4" />
            </button>

            {/* LIVE WALLET BALANCE WIDGET (Hidden for Admins) */}
            {role !== "Admin" && (
              <Link
                to="/wallet"
                className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer ml-2"
                title="Go to Wallet"
              >
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-blue-800 text-sm">
                  $
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Link>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthenticatedLayout;
