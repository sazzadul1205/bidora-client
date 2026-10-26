import { Link, NavLink } from "react-router-dom"
import { useState, useEffect } from "react"
import { getCurrentUser, logout } from "../../services/authApi"
import { toast } from "../../utils/toast"

function Navbar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      getCurrentUser()
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
    }
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    toast.success("Logged out successfully!")
    window.location.href = "/"
  }

  // Determine dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return "/login";
    const role = user?.account?.roles?.[0];
    if (role === "Admin") return "/admin/dashboard";
    if (role === "Seller") return "/seller/dashboard";
    return "/buyer/dashboard";
  }

  const dashboardPath = getDashboardPath()

  return (
    <header className="bg-white border-b border-gray-100">
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

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className="text-sm font-medium text-gray-900">
            Home
          </NavLink>
          <NavLink to="/auctions" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Browse auctions
          </NavLink>
        </nav>

        {/* Right Side Auth */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar