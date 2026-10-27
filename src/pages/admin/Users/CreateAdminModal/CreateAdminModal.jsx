import { useForm } from "react-hook-form";
import { Shield, X, Loader2 } from "lucide-react";

export default function CreateAdminModal({ onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-700" /> Create Admin Account
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Grant full platform access to a new user.
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
              placeholder="admin@bidora.com"
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-gray-900 hover:bg-black shadow-md"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
