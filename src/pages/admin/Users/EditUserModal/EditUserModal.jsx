import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, X, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getRoles } from "../../../../services/adminApi";

const EXCLUDED = new Set(["seller", "buyer"]);
const ADMIN_ROLES = new Set(["admin", "super admin"]);

export default function EditUserModal({ target, onClose, onSubmit }) {
  const { userData } = useOutletContext() || {};
  const callerIsSuperAdmin = (userData?.account?.roles || []).includes(
    "Super Admin",
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: target?.profile?.fullName || "",
      email: target?.email || "",
      role: target?.roles?.[0] || "Admin",
    },
  });
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRoles();
        const list = (res.data.data || []).filter((r) => {
          const n = (r.name || "").toLowerCase();
          if (EXCLUDED.has(n)) {
            return false;
          }
          if (!callerIsSuperAdmin && ADMIN_ROLES.has(n)) {
            return false;
          }
          return true;
        });
        setRoles(list);
      } catch {
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    })();
  }, [callerIsSuperAdmin]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Pencil className="w-5 h-5 text-text-main" /> Edit User
            </h2>
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-68">
              {target?.email}
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
              {...register("fullName", { required: "Name is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm ${errors.fullName ? "border-danger-500" : "border-border-main"}`}
            />
            {errors.fullName && (
              <p className="text-xs text-danger-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm ${errors.email ? "border-danger-500" : "border-border-main"}`}
            />
            {errors.email && (
              <p className="text-xs text-danger-600 mt-1">
                {errors.email.message}
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
                {...register("role")}
                className="w-full border border-border-main p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-surface"
              >
                {(roles.length ? roles : [{ id: "a", name: "Admin" }]).map(
                  (r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ),
                )}
              </select>
            )}
            <p className="text-xs text-text-muted mt-1">
              {callerIsSuperAdmin
                ? "Super Admin can assign Admin/Super Admin and custom roles."
                : "Custom staff roles only (Admin cannot assign/edit Super Admin)."}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-text-inverse text-sm font-semibold rounded-lg bg-neutral-900 hover:bg-black shadow-md disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
