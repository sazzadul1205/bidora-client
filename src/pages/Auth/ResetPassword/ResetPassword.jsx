import PageTitle from "../../../components/PageTitle";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { resetPassword } from "../../../services/authApi";
import { getErrorMessage } from "../../../utils/apiError";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const newPassword = useWatch({ control, name: "newPassword" });

  const missing = !email || !token;

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await resetPassword({
        email,
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmNewPassword,
      });
      navigate("/login", {
        state: { message: "Password reset successful. You can now sign in with your new password." },
      });
    } catch (err) {
      setServerError(getErrorMessage(err, "Password reset failed. The link may be invalid or expired."));
    }
  };

  return (
    <>
      <PageTitle title="Reset Password" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 md:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-5 sm:p-6 md:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">Reset password</h1>
            <p className="text-sm text-text-muted mt-1 mb-5 sm:mb-6">
              {email ? `Set a new password for ${email}.` : "Set a new password for your account."}
            </p>

            {missing ? (
              <div className="space-y-4">
                <div className="p-3 bg-danger-50 text-danger-700 text-sm rounded-lg border border-danger-100">
                  This password reset link is invalid or incomplete. Please request a new reset email.
                </div>
                <Link to="/forgot-password" className="inline-flex text-primary-600 font-medium hover:underline">
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <>
                {serverError && (
                  <div className="mb-4 p-3 bg-danger-50 text-danger-700 text-xs sm:text-sm rounded-lg border border-danger-100">
                    {serverError}
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1">New password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter a new password"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors.newPassword ? "border-danger-500" : "border-border-main"}`}
                      {...register("newPassword", {
                        required: "New password is required.",
                        minLength: { value: 8, message: "Password must be at least 8 characters." },
                      })}
                    />
                    {errors.newPassword && <p className="text-danger-500 text-xs mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1">Confirm new password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter the new password"
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors.confirmNewPassword ? "border-danger-500" : "border-border-main"}`}
                      {...register("confirmNewPassword", {
                        required: "Please confirm your password.",
                        validate: (value) => value === newPassword || "Passwords do not match.",
                      })}
                    />
                    {errors.confirmNewPassword && (
                      <p className="text-danger-500 text-xs mt-1">{errors.confirmNewPassword.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-text-inverse font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center text-sm text-text-muted">
              <Link to="/login" className="text-primary-600 font-medium hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
