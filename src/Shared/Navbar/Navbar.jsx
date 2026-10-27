import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "../../services/authApi";
import { getMyWallet } from "../../services/buyerApi";
import { toast } from "../../utils/toast";
import { Wallet, LogOut, LayoutDashboard } from "lucide-react";

function Navbar() {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getCurrentUser();
          const userData = res.data;
          setUser(userData);

          const role = userData?.account?.roles?.[0];

          // If the user is a Buyer, fetch their wallet balance
          if (role === "Buyer") {
            try {
              const walletRes = await getMyWallet();
              setWalletBalance(walletRes.data.data.balance || 0);
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
    toast.success("Logged out successfully!");
    window.location.href = "/";
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    const role = user?.account?.roles?.[0];
    if (role === "Admin") return "/admin/dashboard";
    if (role === "Seller") return "/seller/dashboard";
    return "/buyer/dashboard";
  };

  const role = user?.account?.roles?.[0];

  // Reusable NavLink classes for the center links with an active underline
  const navLinkClass = ({ isActive }) =>
    `relative flex items-center px-1 py-5 text-sm font-medium transition-colors border-b-2 ${isActive
      ? "border-blue-600 text-gray-900"
      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
    }`;

  return (
    <header className="bg-white border-b border-gray-100 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Bidora</span>
        </Link>

        {/* Center Links (With Active Underline) */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/auctions" className={navLinkClass}>
            Browse auctions
          </NavLink>
        </nav>

        {/* Right Side Auth & User Info */}
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">

                  {/* Buyer Wallet Balance */}
                  {role === "Buyer" && walletBalance !== null && (
                    <Link
                      to="/wallet"
                      className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Go to Wallet"
                    >
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-blue-800 text-sm">
                        ${walletBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </Link>
                  )}

                  {/* User Info & Dashboard Link */}
                  <div className="hidden lg:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-gray-900 leading-tight">
                      {user.profile?.fullName || "User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.account?.email}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                  <Link
                    to={getDashboardPath()}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>

                  {/* Red Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Log out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;