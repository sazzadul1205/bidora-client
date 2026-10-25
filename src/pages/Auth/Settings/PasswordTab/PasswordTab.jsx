import { useForm, useWatch  } from "react-hook-form";
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
      toast.error(
        error.response?.data?.message || "Failed to change password.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a strong password that you do not use elsewhere.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          {...register("currentPassword", {
            required: "Current password is required.",
          })}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.currentPassword ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.newPassword ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
          className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmNewPassword ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.confirmNewPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {isSubmitting ? "Changing..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}
