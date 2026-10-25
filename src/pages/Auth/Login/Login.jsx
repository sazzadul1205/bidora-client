import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TrendingUp, Package, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { login } from "../../../services/authApi";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  // Catch the success message passed from the Register page
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
      // Redirect to the authenticated dashboard upon successful login
      navigate("/dashboard"); 
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        err.response?.data ||
        "Invalid email or password. Please try again."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-5 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Column - Marketing */}
        <div className="max-w-lg">
          <p className="text-blue-600 font-semibold text-sm tracking-wide mb-4">
            Your next great find awaits
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Welcome back to your marketplace.
          </h1>
          <p className="text-gray-500 mb-10 text-lg">
            One account. A clear view of your bids, products and auction results.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="shrink-0 mt-1"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Keep your bids in view</h3>
                <p className="text-sm text-gray-500 mt-1">Know where you're leading or when it's time to bid again.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 mt-1"><Package className="w-5 h-5 text-blue-600" /></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Manage your products</h3>
                <p className="text-sm text-gray-500 mt-1">Track approvals, schedules and results from one place.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 mt-1"><ShieldCheck className="w-5 h-5 text-blue-600" /></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">The right workspace for you</h3>
                <p className="text-sm text-gray-500 mt-1">Buyer, seller and admin access follow your account role.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Login Card */}
        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Log in</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">Good to see you again.</p>

            {/* ✅ Green Success Banner (from registration) */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Red Error Banner */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {serverError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="nadia.rahman@email.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-2 disabled:opacity-70"
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                You'll be taken to your buyer, seller or admin dashboard based on your account role.
              </p>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              New to Bidora?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;