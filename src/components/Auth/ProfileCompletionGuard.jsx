import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authApi";
import AuctionLoader from "../AuctionLoader";

export default function ProfileCompletionGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getCurrentUser();
        if (!mounted) {
          return;
        }

        const user = res.data?.data;
        const role = user?.account?.roles?.[0];
        const profile = user?.profile || {};
        const account = user?.account || {};

        // Admins bypass profile-completion checks
        if (role === "Admin") {
          setAllowed(true);
          return;
        }

        const isComplete = Boolean(
          profile.fullName &&
          account.phoneNumber &&
          profile.address &&
          profile.city &&
          profile.nationalIdNumber,
        );

        // Verification status enum is NotSubmitted | PendingReview | Verified | Rejected
        const status = profile.verificationStatus || "NotSubmitted";

        if (isComplete && status === "Verified") {
          setAllowed(true);
          return;
        }

        navigate("/profile-pending", { replace: true });
      } catch (err) {
        console.error("Profile check failed:", err);
        if (mounted) {
          navigate("/login", { replace: true });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return <AuctionLoader />;
  }

  if (!allowed) {
    return null;
  }

  return children;
}
