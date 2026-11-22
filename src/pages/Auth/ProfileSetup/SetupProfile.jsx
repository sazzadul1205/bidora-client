import PageTitle from "../../../components/PageTitle";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle2, ShoppingBag, Store } from "lucide-react";
import { setupProfile, getCurrentUser } from "../../../services/authApi";
import { getErrorMessage } from "../../../utils/apiError";
import { toast } from "../../../utils/toast";

function getDashboardPath(role) {
  if (role === "Admin") {
    return "/admin/dashboard";
  }
  if (role === "Seller") {
    return "/seller/dashboard";
  }
  return "/buyer/dashboard";
}

function StepBadge({ step, label, active, completed }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-bold transition-colors ${
          completed
            ? "border-green-600 bg-green-600 text-white"
            : active
              ? "border-primary-600 bg-white text-primary-600"
              : "border-neutral-300 bg-white text-neutral-400"
        }`}
      >
        {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
      </span>
      <span
        className={`text-xs font-medium transition-colors ${
          active || completed ? "text-text-main" : "text-neutral-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function SetupProfile() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Redirect already-complete users so they don't repeatedly see setup.
  // Unauthenticated users are sent to login.
  useEffect(() => {
    let cancel = false;
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (!cancel) {
          navigate("/login", { replace: true });
          setMounted(true);
        }
        return;
      }
      try {
        const res = await getCurrentUser();
        if (cancel) {
          return;
        }
        const complete =
          res.data?.data?.profile?.isProfileSetupCompleted === true;
        const role = res.data?.data?.account?.roles?.[0];
        if (complete) {
          navigate(getDashboardPath(role), { replace: true });
        } else {
          setMounted(true);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          if (!cancel) {
            navigate("/login", { replace: true });
            setMounted(true);
          }
          return;
        }
        if (!cancel) {
          setMounted(true);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [navigate]);

  if (!mounted) {
    return null;
  }

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await setupProfile({
        fullName: data.fullName,
        role: data.role,
        phoneNumber: data.phoneNumber,
        address: data.address || "",
        city: data.city || "",
      });

      const roles = JSON.parse(localStorage.getItem("roles") || "[]");
      toast.success("Profile setup completed successfully.");
      navigate(getDashboardPath(roles[0]), { replace: true });
    } catch (err) {
      setServerError(
        getErrorMessage(err, "Profile setup failed. Please try again."),
      );
    }
  };

  return (
    <>
      <PageTitle title="Complete Your Profile" />
      <div className="min-h-screen bg-bg-alt flex flex-col">
        <nav className="bg-surface border-b border-border-main px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto h-12 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary-600 font-bold text-sm tracking-tight"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to marketplace</span>
            </Link>
          </div>
        </nav>

        <main className="flex-1">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            {/* Onboarding progress */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-text-main uppercase tracking-wider">
                  Account setup
                </h2>
                <span className="text-xs font-medium text-primary-600">
                  Step 2 of 2
                </span>
              </div>
              <div className="flex items-center gap-4">
                <StepBadge step="1" label="Create account" active={false} completed />
                <div className="flex-1 h-px bg-neutral-200" />
                <StepBadge step="2" label="Complete profile" active completed={false} />
              </div>
            </div>

            <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-6 sm:p-8 md:p-10">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-main tracking-tight mb-2">
                  Tell us about yourself
                </h1>
                <p className="text-text-muted text-sm">
                  Your account is created. Finish setup so you can bid, sell,
                  and manage your wallet. KYC verification remains optional
                  and separate from this step.
                </p>
              </div>

              {serverError && (
                <div className="mb-6 p-3.5 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-xs sm:text-sm">
                  {serverError}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className={`w-full px-3.5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                      errors.fullName ? "border-danger-500" : "border-border-main"
                    }`}
                    {...register("fullName", {
                      required: "Full name is required",
                      maxLength: {
                        value: 150,
                        message: "Full name must be at most 150 characters",
                      },
                    })}
                  />
                  {errors.fullName && (
                    <p className="text-danger-500 text-xs mt-1.5">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2.5">
                    Account type
                  </label>
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setChecked(false)}
                      aria-pressed={!checked}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-colors ${
                        !checked
                          ? "border-primary-600 bg-primary-50/40"
                          : "border-border-main hover:border-neutral-300 bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            !checked ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-400"
                          }`}>
                            <ShoppingBag className="w-3 h-3" />
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              !checked ? "text-primary-900" : "text-text-main"
                            }`}
                          >
                            Buyer
                          </span>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full border transition-colors shrink-0 ${
                            !checked ? "border-primary-600" : "border-neutral-300"
                          }`}
                        >
                          {!checked && <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />}
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-500 leading-none">
                        Bid and buy
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChecked(true)}
                      aria-pressed={checked}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-colors ${
                        checked
                          ? "border-primary-600 bg-primary-50/40"
                          : "border-border-main hover:border-neutral-300 bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            checked ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-400"
                          }`}>
                            <Store className="w-3 h-3" />
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              checked ? "text-primary-900" : "text-text-main"
                            }`}
                          >
                            Seller
                          </span>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full border transition-colors shrink-0 ${
                            checked ? "border-primary-600" : "border-neutral-300"
                          }`}
                        >
                          {checked && <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />}
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-500 leading-none">
                        Sell your stuff
                      </span>
                    </button>
                  </div>
                  <input
                    type="hidden"
                    {...register("role", {
                      required: "Please select an account type",
                    })}
                    value={checked ? "Seller" : "Buyer"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`w-full px-3.5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                      errors.phoneNumber ? "border-danger-500" : "border-border-main"
                    }`}
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      maxLength: {
                        value: 20,
                        message: "Phone number must be at most 20 characters",
                      },
                    })}
                  />
                  {errors.phoneNumber && (
                    <p className="text-danger-500 text-xs mt-1.5">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street address"
                      className={`w-full px-3.5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                        errors.address ? "border-danger-500" : "border-border-main"
                      }`}
                      {...register("address", {
                        maxLength: {
                          value: 300,
                          message: "Address must be at most 300 characters",
                        },
                      })}
                    />
                    {errors.address && (
                      <p className="text-danger-500 text-xs mt-1.5">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      className={`w-full px-3.5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                        errors.city ? "border-danger-500" : "border-border-main"
                      }`}
                      {...register("city", {
                        maxLength: {
                          value: 100,
                          message: "City must be at most 100 characters",
                        },
                      })}
                    />
                    {errors.city && (
                      <p className="text-danger-500 text-xs mt-1.5">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-colors mt-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>Completing setup... <span className="animate-spin"></span></>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" /> Complete setup
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <Link
                to="/login"
                className="text-sm text-text-muted hover:text-primary-600 hover:underline"
              >
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default SetupProfile;
