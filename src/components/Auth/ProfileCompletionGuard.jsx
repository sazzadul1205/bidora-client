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
        const isComplete = user?.profile?.isProfileSetupCompleted === true;

        // Admins are pre-provisioned and bypass buyer/seller onboarding.
        if (role === "Admin") {
          setAllowed(true);
          return;
        }

        if (!isComplete) {
          navigate("/setup-profile", { replace: true });
          return;
        }

        setAllowed(true);
      } catch (err) {
        console.error("Profile completion check failed:", err);
        if (mounted) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            navigate("/login", { replace: true });
          } else {
            navigate("/setup-profile", { replace: true });
          }
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
