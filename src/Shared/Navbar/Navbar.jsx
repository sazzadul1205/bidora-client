import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "../../services/authApi";
import { getMyWallet } from "../../services/buyerApi";
import { Wallet, LogOut, LayoutDashboard, Menu, X } from "lucide-react";

function Navbar() {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getCurrentUser();
          const userData = res.data;
          setUser(userData);

          const role = userData?.account?.roles?.[0];

          if (role === "Buyer") {
            try {
              const walletRes = await getMyWallet();
              const walletData = walletRes.data?.data || walletRes.data || {};
              const totalBal = walletData.balance ?? 0;
              const reservedBal = walletData.reservedBalance ?? 0;
              const avail = walletData.availableBalance;
              setWalletBalance(
                Math.max(
                  0,
                  avail !== undefined && avail !== null
                    ? avail
                    : totalBal - reservedBal,
                ),
              );
            } catch (err) {
              console.warn("Could not fetch wallet", err);
            }
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setWalletBalance(null);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!user) {
      return "/login";
    }
    const role = user?.account?.roles?.[0];
    if (role === "Admin") {
      return "/admin/dashboard";
    }
    if (role === "Seller") {
      return "/seller/dashboard";
    }
    return "/buyer/dashboard";
  };

  const role = user?.account?.roles?.[0];

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center px-1 py-5 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? "border-primary-600 text-text-main"
        : "border-transparent text-text-muted hover:text-text-main hover:border-neutral-300"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? "bg-primary-50 text-primary-700"
        : "text-text-main hover:bg-neutral-50"
    }`;

  return (
    <header className="bg-surface border-b border-border-main relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Center Links */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/auctions" className={navLinkClass}>
            Browse auctions
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About Us
          </NavLink>
        </nav>

        {/* Right Side Auth & User Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Buyer Wallet Balance */}
                  {role === "Buyer" && walletBalance !== null && (
                    <Link
                      to="/wallet"
                      className="hidden sm:flex items-center gap-2 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                      title="Go to Wallet"
                    >
                      <Wallet className="w-4 h-4 text-primary-600" />
                      <span className="font-bold text-primary-800 text-sm">
                        ৳
                        {walletBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </Link>
                  )}

                  {/* Desktop User Info & Dashboard */}
                  <div className="hidden lg:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-text-main leading-tight">
                      {user.profile?.fullName || "User"}
                    </span>
                    <span className="text-xs text-text-muted">
                      {user.account?.email}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-neutral-200 mx-1 hidden sm:block"></div>

                  <Link
                    to={getDashboardPath()}
                    className="hidden sm:flex text-sm font-medium text-text-main hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>

                  {/* Desktop Logout */}
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex text-sm font-medium text-danger-600 hover:text-text-inverse bg-danger-50 hover:bg-danger-600 px-3 py-2 rounded-lg transition-colors items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Log out</span>
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-text-main hover:text-primary-600 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-primary-600 text-text-inverse px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    Create account
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-text-muted hover:bg-neutral-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border-main shadow-lg z-50">
          <div className="px-4 py-4 space-y-2">
            <NavLink
              to="/"
              end
              className={mobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/auctions"
              className={mobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse auctions
            </NavLink>
            <NavLink
              to="/about"
              className={mobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </NavLink>

            <div className="h-px bg-border-main my-2"></div>

            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-text-main hover:bg-neutral-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/wallet"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-text-main hover:bg-neutral-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Wallet
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-center text-sm font-medium text-text-main border border-border-main rounded-lg hover:bg-neutral-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-center text-sm font-medium bg-primary-600 text-text-inverse rounded-lg hover:bg-primary-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
