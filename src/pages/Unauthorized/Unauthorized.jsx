import { Link, useNavigate } from "react-router-dom";
import { ShieldOff, Home, ArrowLeft, LogIn } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  // Read role from localStorage so we can point them to their own dashboard
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const primaryRole = roles[0];

  const dashboardLink =
    primaryRole === "Admin"
      ? "/admin/dashboard"
      : primaryRole === "Seller"
        ? "/seller/dashboard"
        : primaryRole === "Buyer"
          ? "/buyer/dashboard"
          : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        {/* Icon */}
        <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-full mb-5">
          <ShieldOff className="w-10 h-10" />
        </div>

        {/* Error code */}
        <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
          403 — Access Denied
        </p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You don't have access to this page
        </h1>

        {/* Message */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {token
            ? `Your account (${
                primaryRole || "guest"
              }) doesn't have permission to view this area. If you think this is a mistake, contact support.`
            : "You need to be signed in to view this page."}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {dashboardLink && (
            <Link
              to={dashboardLink}
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to my dashboard
            </Link>
          )}

          {!token && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </Link>
          )}

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to home
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Go back to previous page
        </button>
      </div>
    </div>
  );
}
