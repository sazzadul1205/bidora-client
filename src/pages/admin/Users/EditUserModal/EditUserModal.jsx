import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pencil, X, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getRoles } from "../../../../services/adminApi";

const EXCLUDED = new Set(["seller", "buyer"]);
const ADMIN_ROLES = new Set(["admin", "super admin"]);

export default function EditUserModal({ target, onClose, onSubmit }) {
  const { userData } = useOutletContext() || {};
  const callerIsSuperAdmin = (userData?.account?.roles || []).includes("Super Admin");
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
          if (EXCLUDED.has(n)) {return false;}
          if (!callerIsSuperAdmin && ADMIN_ROLES.has(n)) {return false;} // non-Super-Admin can't assign Admin/Super Admin
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-gray-700" /> Edit User
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
              {target?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              {...register("fullName", { required: "Name is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 px-2.5 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading roles…
              </div>
            ) : (
              <select
                {...register("role")}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm bg-white"
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
            <p className="text-xs text-gray-500 mt-1">
              {callerIsSuperAdmin ? "Super Admin can assign Admin/Super Admin and custom roles." : "Custom staff roles only (Admin cannot assign/edit Super Admin)."}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingRoles}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg bg-gray-900 hover:bg-black shadow-md disabled:opacity-50"
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
