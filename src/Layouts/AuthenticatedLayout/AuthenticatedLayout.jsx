import { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Gavel,
  Wallet,
  Settings,
  ArrowLeft,
  LogOut,
  Package,
  Users,
  ShieldCheck,
  CreditCard,
  Scale,
  CheckCircle,
  Trophy,
  ShoppingCart,
  Activity,
  Menu,
  X,
  Shield,
} from "lucide-react";
import authApi, {
  logout,
  getCurrentUser,
  getAuthConfig,
} from "../../services/authApi";
import AuctionLoader from "../../components/AuctionLoader";
import { formatDateTime } from "../../utils/date";

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userRes = await getCurrentUser();
        setUserData(userRes.data);

        const currentRoles = userRes.data?.account?.roles || [];
        const isStaffUser =
          currentRoles.includes("Admin") ||
          currentRoles.some((r) => r !== "Buyer" && r !== "Seller");

        if (!isStaffUser) {
          try {
            const walletRes = await authApi.get("/wallet/me", getAuthConfig());

            setBalance(Math.max(0, walletRes.data.data.availableBalance || 0));
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
    })();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-50 text-primary-700"
        : "text-text-muted hover:bg-neutral-100 hover:text-text-main"
    }`;

  if (loading) {
    return <AuctionLoader />;
  }

  const roles = userData?.account?.roles || [];
  const isStaff =
    roles.includes("Admin") ||
    roles.some((r) => r !== "Buyer" && r !== "Seller");
  const isBuyer = roles.includes("Buyer");
  const isSeller = roles.includes("Seller");
  const currentDate = formatDateTime(new Date()) + " (Local)";

  const dashboardLink = isStaff
    ? "/admin/dashboard"
    : isSeller
      ? "/seller/dashboard"
      : "/buyer/dashboard";

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border-main flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border-main shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 p-1.5 rounded-md text-text-inverse">
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
              <span className="text-xl font-bold text-text-main tracking-tight">
                Bidora
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-text-muted hover:bg-neutral-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Navigation Links */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-5
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-neutral-300
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
              scrollbar-thin
              [scrollbar-color:#d1d5db_transparent]"
            >
            <div>
              <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Overview
              </p>
              <nav className="space-y-1">
                <NavLink
                  to={dashboardLink}
                  end
                  className={navLinkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </NavLink>

                {isBuyer && !isStaff && (
                  <>
                    <NavLink
                      to="/buyer/bids"
                      className={navLinkClass}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Gavel className="w-4 h-4" /> My bids
                    </NavLink>
                    <NavLink
                      to="/buyer/won"
                      className={navLinkClass}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Trophy className="w-4 h-4" /> Won Auctions
                    </NavLink>
                    <NavLink
                      to="/wallet"
                      className={navLinkClass}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Wallet className="w-4 h-4" /> My wallet
                    </NavLink>
                  </>
                )}

                {isSeller && !isStaff && (
                  <>
                    <NavLink
                      to="/seller/products"
                      className={navLinkClass}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Package className="w-4 h-4" /> My products
                    </NavLink>
                    <NavLink
                      to="/seller/sales"
                      className={navLinkClass}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" /> My sales
                    </NavLink>
                    <NavLink
                      to="/wallet"
                      className={navLinkClass}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Wallet className="w-4 h-4" /> My wallet
                    </NavLink>
                  </>
                )}

                {isStaff && (
                  <>
                    <div className="mt-3">
                      <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Validation & Moderation
                      </p>
                      <nav className="space-y-1">
                        <NavLink
                          to="/admin/verifications"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <CheckCircle className="w-4 h-4" /> Profile
                          Verifications
                        </NavLink>
                        <NavLink
                          to="/admin/deposits"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <CreditCard className="w-4 h-4" /> Deposit Requests
                        </NavLink>
                        <NavLink
                          to="/admin/products"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <ShieldCheck className="w-4 h-4" /> Product Moderation
                        </NavLink>
                      </nav>
                    </div>

                    <div className="mt-4">
                      <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Management
                      </p>
                      <nav className="space-y-1">
                        <NavLink
                          to="/admin/users"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Users className="w-4 h-4" /> User Management
                        </NavLink>
                        <NavLink
                          to="/admin/auctions"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Gavel className="w-4 h-4" /> Auctions
                        </NavLink>
                        <NavLink
                          to="/admin/disputes"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Scale className="w-4 h-4" /> Disputes
                        </NavLink>
                        <NavLink
                          to="/admin/categories"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" /> Categories
                        </NavLink>
                        <NavLink
                          to="/admin/roles"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Shield className="w-4 h-4" /> Roles
                        </NavLink>
                        <NavLink
                          to="/admin/wallet"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Wallet className="w-4 h-4" /> Platform Wallet
                        </NavLink>
                        <NavLink
                          to="/admin/transactions"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Activity className="w-4 h-4" /> Financial Ledger
                        </NavLink>
                        <NavLink
                          to="/admin/sales"
                          className={navLinkClass}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <ShoppingCart className="w-4 h-4" /> Sales &
                          Deliveries
                        </NavLink>
                      </nav>
                    </div>
                  </>
                )}
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Activity
              </p>
              <nav className="space-y-1">
                <NavLink
                  to="/settings"
                  className={navLinkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings className="w-4 h-4" /> Account settings
                </NavLink>
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Explore
              </p>
              <nav className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-neutral-100 hover:text-text-main transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ArrowLeft className="w-4 h-4" /> Back to marketplace
                </Link>
              </nav>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-border-main p-3 shrink-0 bg-surface">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-surface border-b border-border-main flex items-center justify-between px-4 sm:px-6 md:px-8 shrink-0 z-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-text-muted hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:block text-xs text-neutral-400">
              {currentDate}
            </span>
            {!isStaff && (
              <Link
                to="/wallet"
                className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                title="Go to Wallet"
              >
                <Wallet className="w-4 h-4 text-primary-600" />
                <span className="font-bold text-primary-800 text-sm">
                  ৳
                  {balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Link>
            )}
          </div>
</header>

        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-neutral-50
            scrollbar-gutter-stable
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-neutral-300
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
            scrollbar-thin
            [scrollbar-color:#d1d5db_transparent]"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ userData }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AuthenticatedLayout;
