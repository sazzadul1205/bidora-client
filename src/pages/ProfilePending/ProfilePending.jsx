import PageTitle from "../../components/PageTitle";
import { Link } from 'react-router-dom';
import { User, Clock, CheckCircle } from 'lucide-react';

export default function ProfilePending() {
return (
    <>
      <PageTitle title="Profile Pending" />
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm border border-neutral-100 p-8 text-center">
        <div className="bg-primary-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <User className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-text-main mb-2">Profile Setup Required</h1>
        <p className="text-text-muted mb-6">
          Please complete your profile and submit it for verification. Once submitted, your account will be reviewed and approved by an administrator.
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-left bg-neutral-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5 text-neutral-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-main">Complete Profile</p>
              <p className="text-xs text-text-muted">Fill in all required information in Settings</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left bg-neutral-50 p-3 rounded-lg">
            <Clock className="w-5 h-5 text-warning-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-main">Wait for Approval</p>
              <p className="text-xs text-text-muted">Admin will review and approve your profile</p>
            </div>
          </div>
        </div>
        <Link to="/settings" className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-text-inverse rounded-lg hover:bg-primary-700 transition-colors font-medium">
          Go to Settings
        </Link>
      </div>
    </div>
    </>
  );
}
