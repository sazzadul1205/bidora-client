import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getCurrentUser, updateProfile, changePassword } from '../../../services/authApi';
import { submitProfileVerification } from '../../../services/buyerApi';
import { submitProfileVerification as submitProfileVerificationSeller } from '../../../services/sellerApi';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import { toast } from '../../../utils/toast';

export default function Settings() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
    watch,
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUserData(res.data);
        resetProfile({
          fullName: res.data?.profile?.fullName || '',
          phoneNumber: res.data?.profile?.phoneNumber || '',
          address: res.data?.profile?.address || '',
          city: res.data?.profile?.city || '',
          nationalId: res.data?.profile?.nationalId || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [resetProfile]);

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
      const res = await getCurrentUser();
      setUserData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSubmitVerification = async () => {
    const role = userData?.account?.roles?.[0];
    const profile = userData?.profile || {};
    const isComplete = profile.fullName && profile.phoneNumber && profile.address && profile.city && profile.nationalId;
    if (!isComplete) {
      toast.error('Please complete all required profile fields before requesting verification');
      return;
    }
    setSubmittingVerification(true);
    try {
      if (role === 'Seller') {
        await submitProfileVerificationSeller();
      } else {
        await submitProfileVerification();
      }
      toast.success('Verification request submitted');
      const res = await getCurrentUser();
      setUserData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit verification request');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-xl border border-gray-200 p-8 shadow-sm'>
          <div className='animate-pulse'>
            <div className='h-6 bg-gray-200 rounded w-48 mb-6'></div>
            <div className='space-y-4'>
              <div className='h-10 bg-gray-200 rounded'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
              <div className='h-10 bg-gray-200 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Account Settings</h1>
        <p className='text-gray-500 mt-1'>Manage your profile information and password</p>
      </div>
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='border-b border-gray-200'>
          <nav className='flex'>
            <button onClick={() => setActiveTab('profile')} className={'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ' + (activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900')}>
              <User className='w-4 h-4' />Profile Information
            </button>
            <button onClick={() => setActiveTab('password')} className={'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ' + (activeTab === 'password' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900')}>
              <Lock className='w-4 h-4' />Change Password
            </button>
            {(userData?.account?.roles?.[0] === 'Buyer' || userData?.account?.roles?.[0] === 'Seller') && (
              <button onClick={() => setActiveTab('verification')} className={'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ' + (activeTab === 'verification' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900')}>
                <ShieldCheck className='w-4 h-4' />Verification
              </button>
            )}
          </nav>
        </div>
        <div className='p-6'>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                  <input type='email' value={userData?.email || ''} disabled className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm' />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Role</label>
                  <input type='text' value={userData?.account?.roles?.[0] || ''} disabled className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm' />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                <input type='text' className={'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ' + (profileErrors.fullName ? 'border-red-500' : 'border-gray-300')} {...registerProfile('fullName', { required: 'Full name is required' })} />
                {profileErrors.fullName && <p className='text-xs text-red-600 mt-1'>{profileErrors.fullName.message}</p>}
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                  <input type='text' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm' {...registerProfile('phoneNumber')} />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>National ID</label>
                  <input type='text' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm' {...registerProfile('nationalId')} />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
                <input type='text' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm' {...registerProfile('city')} />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                <textarea rows='3' className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm' {...registerProfile('address')} />
              </div>
              <div className='flex justify-end pt-4'>
                <button type='submit' disabled={profileSubmitting} className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium'>
                  <Save className='w-4 h-4' />{profileSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className='space-y-4 max-w-md'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Current Password</label>
                <input type='password' className={'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ' + (passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300')} {...registerPassword('currentPassword', { required: 'Current password is required' })} />
                {passwordErrors.currentPassword && <p className='text-xs text-red-600 mt-1'>{passwordErrors.currentPassword.message}</p>}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>New Password</label>
                <input type='password' className={'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ' + (passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300')} {...registerPassword('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} />
                {passwordErrors.newPassword && <p className='text-xs text-red-600 mt-1'>{passwordErrors.newPassword.message}</p>}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm New Password</label>
                <input type='password' className={'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ' + (passwordErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300')} {...registerPassword('confirmNewPassword', { required: 'Please confirm your password', validate: (value) => value === newPassword || 'Passwords do not match' })} />
                {passwordErrors.confirmNewPassword && <p className='text-xs text-red-600 mt-1'>{passwordErrors.confirmNewPassword.message}</p>}
              </div>
              <div className='flex justify-end pt-4'>
                <button type='submit' disabled={passwordSubmitting} className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium'>
                  <Lock className='w-4 h-4' />
                  {passwordSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'verification' && (userData?.account?.roles?.[0] === 'Buyer' || userData?.account?.roles?.[0] === 'Seller') && (
            <div className='space-y-4'>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h3 className='text-sm font-medium text-blue-900 mb-2'>Profile Verification</h3>
                <p className='text-sm text-blue-700 mb-4'>
                  Complete your profile with all required information (Full Name, Phone, Address, City, National ID) and submit for verification. Your account will need to be approved before you can use all features.
                </p>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Profile Complete:</span>
                    <span className={userData?.profile?.fullName && userData?.profile?.phoneNumber && userData?.profile?.address && userData?.profile?.city && userData?.profile?.nationalId ? 'text-green-600' : 'text-orange-600'}>
                      {userData?.profile?.fullName && userData?.profile?.phoneNumber && userData?.profile?.address && userData?.profile?.city && userData?.profile?.nationalId ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Verification Status:</span>
                    <span className={`${(userData?.profile?.verificationStatus === 'Verified' || userData?.profile?.status === 'Verified' || userData?.profile?.verificationStatus === 'Approved') ? 'text-green-600' : (userData?.profile?.verificationStatus === 'Pending' || userData?.profile?.status === 'Pending') ? 'text-orange-600' : 'text-gray-600'}`}>
                      {userData?.profile?.verificationStatus || userData?.profile?.status || 'Not Submitted'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex justify-end'>
                <button
                  onClick={handleSubmitVerification}
                  disabled={submittingVerification || (userData?.profile?.verificationStatus === 'Pending') || (userData?.profile?.status === 'Pending') || (userData?.profile?.verificationStatus === 'Verified') || (userData?.profile?.status === 'Verified')}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
                >
                  <ShieldCheck className='w-4 h-4' />
                  {submittingVerification ? 'Submitting...' : ((userData?.profile?.verificationStatus === 'Pending' || userData?.profile?.status === 'Pending')) ? 'Verification Pending' : ((userData?.profile?.verificationStatus === 'Verified' || userData?.profile?.status === 'Verified')) ? 'Verified' : 'Submit for Verification'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
