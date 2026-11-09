import { useForm } from "react-hook-form";
import { X, KeyRound, Loader2 } from "lucide-react";

export default function ResetPasswordModal({ target, onClose, onSubmit }) {
  if (!target) return null;
  return <Content key={target.userId} target={target} onClose={onClose} onSubmit={onSubmit} />;
}

function Content({ target, onClose, onSubmit }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { newPassword: "" },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" /> Reset Password
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">{target?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Set a new password for this user. This bypasses the current password and any user-side confirmation.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              {...register("newPassword", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
              className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm ${errors.newPassword ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter new password"
              autoFocus
            />
            {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 shadow-md disabled:opacity-50">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
