import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Shield, X, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getRoles } from "../../../../services/adminApi";

const EXCLUDED_ROLES = new Set(["seller", "buyer"]);
const ADMIN_ROLES = new Set(["admin", "super admin"]);

export default function CreateAdminModal({ onClose, onSubmit }) {
  const { userData } = useOutletContext() || {};
  const callerIsSuperAdmin = (userData?.account?.roles || []).includes(
    "Super Admin",
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: "Admin" } });
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getRoles();
        if (cancelled) {
          return;
        }
        const filtered = (res.data.data || []).filter((r) => {
          const n = (r.name || "").toLowerCase();
          if (EXCLUDED_ROLES.has(n)) {
            return false;
          }
          if (!callerIsSuperAdmin && ADMIN_ROLES.has(n)) {
            return false;
          }
          return true;
        });
        setRoles(filtered);
      } catch {
        if (!cancelled) {
          setRoles([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRoles(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [callerIsSuperAdmin]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Shield className="w-5 h-5 text-text-main" /> Create Staff Account
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Grant elevated access to a new user.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Full Name
            </label>
            <input
              type="text"
              {...register("fullName", { required: "Name is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none text-sm ${errors.fullName ? "border-danger-500" : "border-border-main"}`}
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="text-xs text-danger-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none text-sm ${errors.email ? "border-danger-500" : "border-border-main"}`}
              placeholder="staff@bidora.com"
            />
            {errors.email && (
              <p className="text-xs text-danger-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none text-sm ${errors.password ? "border-danger-500" : "border-border-main"}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-danger-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Role
            </label>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-xs text-text-muted px-2.5 py-2.5 border border-border-main rounded-lg bg-neutral-50">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading roles…
              </div>
            ) : (
              <select
                {...register("role", { required: "Role is required" })}
                className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-neutral-500 outline-none text-sm bg-surface ${errors.role ? "border-danger-500" : "border-border-main"}`}
              >
                {roles.length === 0 ? (
                  <option value="Admin">Admin</option>
                ) : (
                  roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                      {r.isSystem ? " (system)" : ""}
                    </option>
                  ))
                )}
              </select>
            )}
            {errors.role && (
              <p className="text-xs text-danger-600 mt-1">
                {errors.role.message}
              </p>
            )}
            <p className="text-xs text-text-muted mt-1">
              {callerIsSuperAdmin
                ? "Super Admin can create Admin/Super Admin and custom roles (no Seller/Buyer)."
                : "Admin can create custom staff roles only (cannot create/edit Super Admin). Sellers/Buyers register publicly."}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-main mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingRoles}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-text-inverse text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-neutral-900 hover:bg-black shadow-md"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
