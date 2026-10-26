import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authApi";

/**
 * ProfileCompletionGuard
 * -----------------------
 * A wrapper component that protects routes for Buyers and Sellers.
 * It ensures the logged-in user has:
 *   1. Completed their profile (Name, Phone, Address, City, National ID).
 *   2. Been verified/approved by an Admin.
 *
 * If the user is an Admin, they bypass this check entirely.
 * If the user is incomplete or unverified, they are redirected to /profile-pending.
 * If the user is not logged in, they are redirected to /login.
 */
export default function ProfileCompletionGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  // React Router hook to programmatically redirect the user
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * An async function that fetches the current user's data,
     * checks their role, profile completeness, and verification status,
     * and updates the component's state accordingly.
     */
    const checkProfile = async () => {
      try {
        // Fetch the currently logged-in user's account + profile data
        const res = await getCurrentUser();
        const user = res.data;

        // Extract role, profile, and account data with safe fallbacks
        const role = user?.account?.roles?.[0];
        const profile = user?.profile || {};
        const account = user?.account || {};


        // Admins do not need to go through the buyer/seller profile
        // verification flow, so we let them in immediately.
        if (role === "Admin") {
          setAllowed(true);
          setLoading(false);
          return;
        }

        // A profile is considered "complete" only if all of these
        // essential fields are filled out.
        const isComplete =
          profile.fullName &&
          account.phoneNumber &&
          profile.address &&
          profile.city &&
          profile.nationalIdNumber;

        // Get the verification status, defaulting to "Incomplete"
        const status = profile.verificationStatus || profile.status || "Incomplete";


        // If the profile is complete AND has been verified/approved,
        // grant access to the protected route.
        if (isComplete && (status === "Verified" || status === "Approved")) {
          setAllowed(true);
          setLoading(false);
          return;
        }

        // Send them to the "Profile Pending" page for instructions.
        navigate("/profile-pending");
      } catch (err) {
        // log the error and redirect to the login page.
        console.error("Profile check failed:", err);
        navigate("/login");
      }
    };

    // Run the profile check when the component mounts
    checkProfile();
  }, [navigate]);

  // While we are waiting for the API response, show a loading screen
  // so the user doesn't briefly see the "redirect" flash.
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Checking profile status...
      </div>
    );
  }


  // If the user is not allowed, we return null because we have
  // already called navigate() to redirect them elsewhere.
  if (!allowed) return null;


  // If everything checks out, render the protected children.
  return children;
}