import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Shield, X, Loader2 } from "lucide-react";
import { getRoles } from "../../../../services/adminApi";

const EXCLUDED_ROLES = new Set(["seller", "buyer"]);

export default function CreateAdminModal({ onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { role: "Admin" },
  });

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getRoles();
        if (cancelled) return;

        const filtered = (res.data.data || []).filter(
          (r) => !EXCLUDED_ROLES.has((r.name || "").toLowerCase()),
        );
        setRoles(filtered);
      } catch {
        if (!cancelled) setRoles([]);
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-700" /> Create Staff Account
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Grant elevated access to a new user.
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
              type="text"
              {...register("fullName", { required: "Name is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${errors.email ? "border-red-500" : "border-gray-300"}`}
              placeholder="staff@bidora.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${errors.password ? "border-red-500" : "border-gray-300"}`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password.message}
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
                {...register("role", { required: "Role is required" })}
                className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm bg-white ${errors.role ? "border-red-500" : "border-gray-300"}`}
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
              <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Only Admin and custom roles can be assigned here. Sellers and
              Buyers register through the public signup flow.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-gray-900 hover:bg-black shadow-md"
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
