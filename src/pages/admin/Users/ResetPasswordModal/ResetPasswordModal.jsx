import { useForm } from "react-hook-form";
import { X, KeyRound, Loader2 } from "lucide-react";

export default function ResetPasswordModal({ target, onClose, onSubmit }) {
  if (!target) {return null;}
  return (
    <Content
      key={target.userId}
      target={target}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function Content({ target, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { newPassword: "" } });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-warning-600" /> Reset Password
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
          <p className="text-sm text-text-muted">
            Set a new password for this user. This bypasses the current password
            and any user-side confirmation.
          </p>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-warning-500 outline-none text-sm ${errors.newPassword ? "border-danger-500" : "border-border-main"}`}
              placeholder="Enter new password"
              autoFocus
            />
            {errors.newPassword && (
              <p className="text-xs text-danger-600 mt-1">
                {errors.newPassword.message}
              </p>
            )}
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-text-inverse text-sm font-semibold rounded-lg bg-warning-600 hover:bg-warning-700 shadow-md disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
