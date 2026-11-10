import PageTitle from "../../components/PageTitle";
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
    <>
      <PageTitle title="Unauthorized" />
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-surface rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
        {/* Icon */}
        <div className="inline-flex p-4 bg-danger-50 text-danger-600 rounded-full mb-5">
          <ShieldOff className="w-10 h-10" />
        </div>

        {/* Error code */}
        <p className="text-xs font-bold uppercase tracking-wider text-danger-600 mb-2">
          403 — Access Denied
        </p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-main mb-3">
          You don't have access to this page
        </h1>

        {/* Message */}
        <p className="text-sm text-text-muted leading-relaxed mb-6">
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
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-text-inverse text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to my dashboard
            </Link>
          )}

          {!token && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-text-inverse text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </Link>
          )}

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-surface border border-neutral-300 hover:bg-neutral-50 text-text-main text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to home
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          ← Go back to previous page
        </button>
      </div>
    </div>
    </>
  );
}
