import PageTitle from "../../../components/PageTitle";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ShoppingBag, Store } from "lucide-react";
import { register as registerUser } from "../../../services/authApi";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("buyer");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const backendRole = role === "buyer" ? "Buyer" : "Seller";
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: backendRole,
      });
      navigate("/login", {
        state: {
          message: "Registration successful! Please log in to continue.",
        },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data ||
          "Registration failed. Please check your details and try again.",
      );
    }
  };

  return (
    <>
      <PageTitle title="Register" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column - Marketing */}
          <div className="hidden lg:block max-w-lg">
            <p className="text-primary-600 font-semibold text-xs tracking-wider uppercase mb-4">
              Join the marketplace
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-text-main leading-tight mb-4">
              Great products.
              <br />
              New possibilities.
            </h1>
            <p className="text-text-muted mb-8 text-base">
              Create an account to bid on your next find or give your products a
              new home.
            </p>

            <div className="bg-neutral-50 border border-border-main rounded-xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-text-main mb-4">
                Choose how you'll use Bidora
              </h3>
              <p className="text-sm text-text-muted mb-3 leading-relaxed">
                <strong className="text-neutral-700 font-medium">Buyers</strong>{" "}
                browse, bid and buy out. Sellers upload products and follow
                their auctions from approval to result.
              </p>
              <p className="text-sm text-text-muted leading-relaxed">
                Products are reviewed before going live. Winners and sellers
                arrange handover directly.
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
            <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-text-main">
                Create your account
              </h2>
              <p className="text-sm text-text-muted mt-1 mb-6">
                Start with the role that's right for you.
              </p>

              {serverError && (
                <div className="mb-4 p-3 bg-danger-50 text-danger-700 text-sm rounded-lg border border-danger-100">
                  {serverError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">
                    I want to join as a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                        role === "buyer"
                          ? "border-primary-600 bg-primary-50/50"
                          : "border-border-main hover:border-neutral-300 bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                          <ShoppingBag
                            className={`w-4 h-4 ${role === "buyer" ? "text-primary-600" : "text-text-muted"}`}
                          />
                          <span
                            className={`text-sm font-medium ${role === "buyer" ? "text-primary-900" : "text-text-main"}`}
                          >
                            Buyer
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === "buyer" ? "border-primary-600" : "border-border-main"}`}
                        >
                          {role === "buyer" && (
                            <div className="w-2 h-2 rounded-full bg-primary-600" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-text-muted">
                        Bid and buy
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                        role === "seller"
                          ? "border-primary-600 bg-primary-50/50"
                          : "border-border-main hover:border-neutral-300 bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-2">
                          <Store
                            className={`w-4 h-4 ${role === "seller" ? "text-primary-600" : "text-text-muted"}`}
                          />
                          <span
                            className={`text-sm font-medium ${role === "seller" ? "text-primary-900" : "text-text-main"}`}
                          >
                            Seller
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === "seller" ? "border-primary-600" : "border-border-main"}`}
                        >
                          {role === "seller" && (
                            <div className="w-2 h-2 rounded-full bg-primary-600" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-text-muted">
                        Sell your stuff
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${errors.fullName ? "border-danger-500" : "border-border-main"}`}
                    {...register("fullName", {
                      required: "Full name is required",
                    })}
                  />
                  {errors.fullName && (
                    <p className="text-danger-500 text-xs mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

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
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  {errors.password ? (
                    <p className="text-danger-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-text-muted">
                      Use at least 8 characters, including a letter and a
                      number.
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

                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-border-main text-primary-600 focus:ring-primary-500"
                      {...register("terms", {
                        required: "You must agree to the terms",
                      })}
                    />
                    <span className="text-xs text-text-muted leading-tight">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Terms of Use
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-danger-500 text-xs mt-1">
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-text-inverse font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors mt-2 capitalize disabled:opacity-70"
                >
                  {isSubmitting
                    ? "Creating account..."
                    : `Create ${role} account`}
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
