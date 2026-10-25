import { Link } from 'react-router-dom';
import { User, Clock, CheckCircle } from 'lucide-react';

export default function ProfilePending() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Setup Required</h1>
        <p className="text-gray-600 mb-6">
          Please complete your profile and submit it for verification. Once submitted, your account will be reviewed and approved by an administrator.
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-left bg-gray-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Complete Profile</p>
              <p className="text-xs text-gray-500">Fill in all required information in Settings</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left bg-gray-50 p-3 rounded-lg">
            <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Wait for Approval</p>
              <p className="text-xs text-gray-500">Admin will review and approve your profile</p>
            </div>
          </div>
        </div>
        <Link to="/settings" className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Go to Settings
        </Link>
      </div>
    </div>
  );
}
