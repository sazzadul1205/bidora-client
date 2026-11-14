import PageTitle from "../../../components/PageTitle";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { forgotPassword } from "../../../services/authApi";
import { getErrorMessage } from "../../../utils/apiError";

export default function ForgotPassword() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetLink, setResetLink] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");
    setResetLink("");
    try {
      const res = await forgotPassword({ email: data.email });
      setSuccess(res?.data?.message || "If the email is registered, a password reset link has been sent.");
      setResetLink(res?.data?.data?.resetLink || "");
    } catch (err) {
      setServerError(getErrorMessage(err, "Failed to send password reset email."));
    }
  };

  return (
    <>
      <PageTitle title="Forgot Password" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 md:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-5 sm:p-6 md:p-8">
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">Forgot password</h1>
            <p className="text-sm text-text-muted mt-1 mb-5 sm:mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {success && (
              <div className="mb-4 p-3 bg-success-50 text-success-700 text-xs sm:text-sm rounded-lg border border-success-200 space-y-1">
                <p>{success}</p>
                {resetLink && (
                  <a href={resetLink} className="text-primary-700 font-medium hover:underline break-all block">
                    Reset password now (development link)
                  </a>
                )}
              </div>
            )}
            {serverError && (
              <div className="mb-4 p-3 bg-danger-50 text-danger-700 text-xs sm:text-sm rounded-lg border border-danger-100">
                {serverError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Email address</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors.email ? "border-danger-500" : "border-border-main"}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-text-inverse font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-text-muted">
              Remembered your password?{" "}
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
