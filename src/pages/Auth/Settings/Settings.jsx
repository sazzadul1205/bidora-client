import { useEffect, useState } from "react";
import { getCurrentUser } from "../../../services/authApi";
import { toast } from "../../../utils/toast";
import { User, Lock, ShieldCheck } from "lucide-react";

// Import Sub-components
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
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-200" />
            <div className="h-32 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage your profile information, identity verification and password.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Tab Navigation */}
        <div className="overflow-x-auto border-b border-gray-200">
          <nav className="flex min-w-max" aria-label="Account settings tabs">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="h-4 w-4" />
              Profile Information
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition ${
                activeTab === "password"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Lock className="h-4 w-4" />
              Change Password
            </button>

            {(role === "Buyer" || role === "Seller") && (
              <button
                type="button"
                onClick={() => setActiveTab("verification")}
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition ${
                  activeTab === "verification"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Verification
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-7">
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
  );
}
