import { useForm, useWatch } from "react-hook-form";
import { changePassword } from "../../../../services/authApi";
import { toast } from "../../../../utils/toast";
import { Lock } from "lucide-react";

export default function PasswordTab() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm();

  const newPassword = useWatch({ control, name: "newPassword" });

  const onSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      toast.success("Password changed successfully.");
      reset();
    } catch (error) {
      toast.errorFrom(error, "Failed to change password.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full sm:max-w-md space-y-4 sm:space-y-5"
    >
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-text-main">
          Change Password
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Choose a strong password that you do not use elsewhere.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-main">
          Current Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          {...register("currentPassword", {
            required: "Current password is required.",
          })}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 ${errors.currentPassword ? "border-danger-500" : "border-border-main"}`}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-danger-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-main">
          New Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register("newPassword", {
            required: "New password is required.",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters.",
            },
          })}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 ${errors.newPassword ? "border-danger-500" : "border-border-main"}`}
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-danger-600">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-main">
          Confirm New Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          {...register("confirmNewPassword", {
            required: "Please confirm your password.",
            validate: (value) =>
              value === newPassword || "Passwords do not match.",
          })}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 ${errors.confirmNewPassword ? "border-danger-500" : "border-border-main"}`}
        />
        {errors.confirmNewPassword && (
          <p className="mt-1 text-xs text-danger-600">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-primary-700 disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {isSubmitting ? "Changing..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}
