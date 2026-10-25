import { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import authApi, {
  logout,
  getCurrentUser,
  getAuthConfig,
} from "../../services/authApi";

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch user data and wallet balance on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get user details (validates the token)
        const userRes = await getCurrentUser();
        setUserData(userRes.data);

        // Determine role immediately
        const currentRole = userRes.data?.account?.roles?.[0];

        // 2. Only fetch wallet balance if the user is NOT an Admin
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
        // If token is invalid/expired, kick them back to login
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
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
          <div className="px-4 py-6 space-y-8">
            <div>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Overview
              </p>
              <nav className="space-y-1">
                <NavLink to="/dashboard" end className={navLinkClass}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </NavLink>

                {role === "Buyer" && (
                  <NavLink to="/dashboard/bids" className={navLinkClass}>
                    <Gavel className="w-4 h-4" /> My bids
                  </NavLink>
                )}

                {role === "Seller" && (
                  <>
                    <NavLink to="/dashboard/products" className={navLinkClass}>
                      <Package className="w-4 h-4" /> My products
                    </NavLink>
                    <NavLink to="/dashboard/auctions" className={navLinkClass}>
                      <Gavel className="w-4 h-4" /> My auctions
                    </NavLink>
                  </>
                )}

                {role === "Admin" && (
                  <>
                    <NavLink to="/dashboard/users" className={navLinkClass}>
                      <Users className="w-4 h-4" /> User Management
                    </NavLink>
                    <NavLink
                      to="/dashboard/moderation"
                      className={navLinkClass}
                    >
                      <ShieldCheck className="w-4 h-4" /> Moderation
                    </NavLink>
                    <NavLink to="/dashboard/deposits" className={navLinkClass}>
                      <CreditCard className="w-4 h-4" /> Deposits
                    </NavLink>
                    <NavLink to="/dashboard/disputes" className={navLinkClass}>
                      <Scale className="w-4 h-4" /> Disputes
                    </NavLink>
                  </>
                )}

                {/* Hide Wallet Link for Admins */}
                {role !== "Admin" && (
                  <NavLink to="/dashboard/wallet" className={navLinkClass}>
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
                <NavLink to="/dashboard/settings" className={navLinkClass}>
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
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-900 cursor-pointer">
              Marketplace
            </span>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900 capitalize">
              {role} account
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
                to="/dashboard/wallet"
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
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AuthenticatedLayout;
