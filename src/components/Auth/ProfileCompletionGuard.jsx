import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/authApi';

export default function ProfileCompletionGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await getCurrentUser();
        const user = res.data;
        const role = user?.account?.roles?.[0];
        const profile = user?.profile || {};

        if (role === 'Admin') {
          setAllowed(true);
          setLoading(false);
          return;
        }

        if (role === 'Buyer' || role === 'Seller') {
          const isComplete = profile.fullName && profile.phoneNumber && profile.address && profile.city && profile.nationalId;
          const status = profile.verificationStatus || profile.status || 'Incomplete';

          if (isComplete && (status === 'Verified' || status === 'Approved')) {
            setAllowed(true);
            setLoading(false);
            return;
          }

          // Not complete or not approved - redirect to profile pending page
          navigate('/profile-pending');
          return;
        }

        setAllowed(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };
    checkProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Checking profile status...
      </div>
    );
  }

  if (!allowed) return null;
  return children;
}
