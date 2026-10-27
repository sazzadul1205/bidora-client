import {
  X,
  Lock,
  Clock,
  CheckCircle2,
  Wallet,
  Shield,
  Phone,
} from "lucide-react";

export default function UserDetailsModal({
  target,
  onClose,
  getLockInfo,
  getInitials,
  formatMoney,
}) {
  if (!target) return null;
  const info = getLockInfo(target);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg shadow-sm border ${info ? "bg-linear-to-br from-red-100 to-red-200 text-red-700 border-red-300" : "bg-linear-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-200"}`}
            >
              {getInitials(target.profile?.fullName)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {target.profile?.fullName || "Unnamed User"}
              </h2>
              <p className="text-xs text-gray-500">{target.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-gray-500" /> Account Security
            </h3>
            {info ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                  {info.isPermanent ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-900 text-sm">{info.label}</p>
                  {info.isPermanent ? (
                    <p className="text-xs text-red-700 mt-1">
                      This account has been permanently banned.
                    </p>
                  ) : (
                    <p className="text-xs text-red-700 mt-1">
                      Lock expires:{" "}
                      <span className="font-semibold">{info.endLabel}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-green-900 text-sm">Active</p>
                  <p className="text-xs text-green-700 mt-1">
                    This account is not locked.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-gray-500" /> Wallet Overview
            </h3>
            {target.wallet ? (
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Available
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {formatMoney(target.wallet.availableBalance)}
                  </p>
                </div>
                <div className="border-l border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Reserved
                  </p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatMoney(target.wallet.reservedBalance)}
                  </p>
                </div>
                <div className="border-l border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Total
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatMoney(target.wallet.balance)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm">
                No wallet data available.
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gray-500" /> Account Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Role</p>
                <p className="font-semibold text-gray-900">
                  {target.roles?.[0] || "Buyer"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />{" "}
                  {target.phoneNumber || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <p className="font-semibold text-gray-900">
                  {target.profile?.address || "N/A"},{" "}
                  {target.profile?.city || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end sticky bottom-0 z-10 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
