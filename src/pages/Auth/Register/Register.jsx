import PageTitle from "../../../components/PageTitle";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { register as registerUser } from "../../../services/authApi";
import { getErrorMessage } from "../../../utils/apiError";

function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      navigate("/setup-profile", {
        replace: true,
        state: {
          message: "Account created successfully. Please complete your profile setup.",
        },
      });
    } catch (err) {
      setServerError(
        getErrorMessage(err, "Registration failed. Please check your details and try again."),
      );
    }
  };

  return (
    <>
      <PageTitle title="Register" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-start lg:items-center">
          {/* Left Column - Marketing (hidden below lg) */}
          <div className="hidden lg:block max-w-lg">
            <p className="text-primary-600 font-semibold text-xs tracking-wider uppercase mb-4">
              Create an account
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold text-text-main leading-tight mb-4">
              Join Bidora.
              <br />
              Start bidding today.
            </h1>
            <p className="text-text-muted mb-8 text-base">
              Create your identity with just your email and password. You will
              complete your buyer or seller profile in the next step.
            </p>

            <div className="bg-neutral-50 border border-border-main rounded-xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-text-main mb-4">
                How onboarding works
              </h3>
              <p className="text-sm text-text-muted mb-3 leading-relaxed">
                <strong className="text-neutral-700 font-medium">Step 1:</strong>{" "}
                Create your account with email and password.
              </p>
              <p className="text-sm text-text-muted mb-3 leading-relaxed">
                <strong className="text-neutral-700 font-medium">Step 2:</strong>{" "}
                Set your profile name, choose Buyer or Seller, and add your
                phone number.
              </p>
              <p className="text-sm text-text-muted leading-relaxed">
                Identity and profile are kept separate so you can connect other
                sign-in methods later.
              </p>
            </div>

            <div className="text-sm text-text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 font-medium hover:underline"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Right Column - Register Card */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-text-main">
                Create your account
              </h2>
              <p className="text-sm text-text-muted mt-1 mb-5 sm:mb-6">
                Start with your email and password.
              </p>

              {serverError && (
                <div className="mb-4 p-3 bg-danger-50 text-danger-700 text-xs sm:text-sm rounded-lg border border-danger-100 wrap-break-word">
                  {serverError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors.email ? "border-danger-500" : "border-border-main"}`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-danger-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a password"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm mb-1 ${errors.password ? "border-danger-500" : "border-border-main"}`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {errors.password ? (
                    <p className="text-danger-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-text-muted">
                      Use at least 6 characters.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors.confirmPassword ? "border-danger-500" : "border-border-main"}`}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value, formValues) =>
                        value === formValues.password ||
                        "Passwords do not match",
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-danger-500 text-xs mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-text-inverse font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors mt-2 capitalize disabled:opacity-70"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-text-muted">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
