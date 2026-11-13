import PageTitle from "../../../components/PageTitle";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TrendingUp, Package, ShieldCheck, CheckCircle2 } from "lucide-react";
import { login, googleLogin, getCurrentUser } from "../../../services/authApi";
import { getErrorMessage } from "../../../utils/apiError";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const successMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login(data);
      const userRes = await getCurrentUser();
      const role = userRes.data?.data?.account?.roles?.[0];

      if (role === "Admin") {
        navigate("/admin/dashboard");
      } else if (role === "Seller") {
        navigate("/seller/dashboard");
      } else if (role === "Buyer") {
        navigate("/buyer/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setServerError(
        getErrorMessage(err, "Invalid email or password. Please try again."),
      );
    }
  };

  return (
    <>
      <PageTitle title="Login" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
          {/* Left Column - Marketing */}
          <div className="hidden lg:block max-w-lg">
            <p className="text-primary-600 font-semibold text-sm tracking-wide mb-4">
              Your next great find awaits
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold text-text-main leading-tight mb-4">
              Welcome back to your marketplace.
            </h1>
            <p className="text-text-muted mb-10 text-lg">
              One account. A clear view of your bids, products and auction
              results.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">
                    Keep your bids in view
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    Know where you're leading or when it's time to bid again.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">
                    Manage your products
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    Track approvals, schedules and results from one place.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-main">
                    The right workspace for you
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    Buyer, seller and admin access follow your account role.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Card */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-text-main">
                Log in
              </h2>
              <p className="text-sm text-text-muted mt-1 mb-5 sm:mb-6">
                Good to see you again.
              </p>

              {successMessage && (
                <div className="mb-4 p-3 bg-success-50 text-success-700 text-xs sm:text-sm rounded-lg border border-success-200 flex items-start gap-2 wrap-break-word">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

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
                    placeholder="nadia.rahman@email.com"
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
                    placeholder="••••••••••••"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors.password ? "border-danger-500" : "border-border-main"}`}
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  {errors.password && (
                    <p className="text-danger-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-text-inverse font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors mt-2 disabled:opacity-70"
                >
                  {isSubmitting ? "Logging in..." : "Log in"}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-main" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-surface px-2 text-text-muted">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        await googleLogin({ idToken: credentialResponse.credential });
                        const userRes = await getCurrentUser();
                        const role = userRes.data?.data?.account?.roles?.[0];
                        if (role === "Admin") {
                          navigate("/admin/dashboard");
                        } else if (role === "Seller") {
                          navigate("/seller/dashboard");
                        } else if (role === "Buyer") {
                          navigate("/buyer/dashboard");
                        } else {
                          navigate("/");
                        }
                      } catch (err) {
                        setServerError(getErrorMessage(err, "Google login failed."));
                      }
                    }}
                    onError={() => {
                      setServerError("Google Login Failed.");
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-text-muted">
                New to Bidora?{" "}
                <Link
                  to="/register"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
