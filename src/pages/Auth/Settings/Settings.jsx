import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../../../services/authApi";
import { toast } from "../../../utils/toast";
import { User, Lock, ShieldCheck } from "lucide-react";

import ProfileTab from "./ProfileTab/ProfileTab";
import PasswordTab from "./PasswordTab/PasswordTab";
import VerificationTab from "./VerificationTab/VerificationTab";

export default function Settings() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const role = userData?.account?.roles?.[0];

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      setUserData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh user data.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUserData(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-border-main bg-surface p-4 sm:p-8 shadow-sm">
          <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 rounded bg-neutral-200" />
            <div className="h-10 rounded bg-neutral-200" />
            <div className="h-10 rounded bg-neutral-200" />
            <div className="h-32 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Settings" />
      <div className="mx-auto max-w-5xl w-full">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">
            Account Settings
          </h1>
          <p className="mt-1 text-text-muted">
            Manage your profile information, identity verification and password.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border-main bg-surface shadow-sm w-full">
          <div className="overflow-x-auto border-b border-border-main scrollbar-thin [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            <nav className="flex min-w-max" aria-label="Account settings tabs">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  activeTab === "profile"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-text-muted hover:text-text-main"
                }`}
              >
                <User className="h-4 w-4" />
                Profile Information
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("password")}
                className={`flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  activeTab === "password"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-text-muted hover:text-text-main"
                }`}
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>

              {(role === "Buyer" || role === "Seller") && (
                <button
                  type="button"
                  onClick={() => setActiveTab("verification")}
                  className={`flex items-center gap-2 border-b-2 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                    activeTab === "verification"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-text-muted hover:text-text-main"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verification
                </button>
              )}
            </nav>
          </div>

          <div className="p-4 sm:p-7 w-full">
            {activeTab === "profile" && (
              <ProfileTab userData={userData} refreshUser={refreshUser} />
            )}

            {activeTab === "password" && <PasswordTab />}

            {activeTab === "verification" &&
              (role === "Buyer" || role === "Seller") && (
                <VerificationTab
                  userData={userData}
                  role={role}
                  refreshUser={refreshUser}
                />
              )}
          </div>
        </div>
      </div>
    </>
  );
}
