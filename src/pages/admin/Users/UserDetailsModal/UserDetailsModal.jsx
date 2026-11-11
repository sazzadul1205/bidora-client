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
  if (!target) {return null;}
  const info = getLockInfo(target);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg shadow-sm border ${
                info
                  ? "bg-linear-to-br from-danger-100 to-danger-200 text-danger-700 border-danger-300"
                  : "bg-linear-to-br from-primary-100 to-primary-200 text-primary-700 border-primary-200"
              }`}
            >
              {getInitials(target.profile?.fullName)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-main">
                {target.profile?.fullName || "Unnamed User"}
              </h2>
              <p className="text-xs text-text-muted">{target.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-text-muted" /> Account Security
            </h3>
            {info ? (
              <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-danger-100 text-danger-600 rounded-lg shrink-0">
                  {info.isPermanent ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-danger-900 text-sm">
                    {info.label}
                  </p>
                  {info.isPermanent ? (
                    <p className="text-xs text-danger-700 mt-1">
                      This account has been permanently banned.
                    </p>
                  ) : (
                    <p className="text-xs text-danger-700 mt-1">
                      Lock expires:{" "}
                      <span className="font-semibold">{info.endLabel}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-success-100 text-success-600 rounded-lg shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-success-900 text-sm">Active</p>
                  <p className="text-xs text-success-700 mt-1">
                    This account is not locked.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-text-muted" /> Wallet Overview
            </h3>
            {target.wallet ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-neutral-50 p-4 rounded-xl border border-border-main text-center">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Available
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-success-600 break-all">
                    {formatMoney(target.wallet.availableBalance)}
                  </p>
                </div>
                <div className="sm:border-l border-border-main pt-2 sm:pt-0 border-t sm:border-t-0">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Reserved
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-warning-600 break-all">
                    {formatMoney(target.wallet.reservedBalance)}
                  </p>
                </div>
                <div className="sm:border-l border-border-main pt-2 sm:pt-0 border-t sm:border-t-0">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Total
                  </p>
                  <p className="text-xl font-bold text-text-main">
                    {formatMoney(target.wallet.balance)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 p-4 rounded-xl text-center text-text-muted text-sm">
                No wallet data available.
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-text-muted" /> Account Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-border-main text-sm">
              <div>
                <p className="text-xs text-text-muted mb-0.5">Role</p>
                <p className="font-semibold text-text-main">
                  {target.roles?.[0] || "Buyer"}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-0.5">Phone</p>
                <p className="font-semibold text-text-main flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />{" "}
                  {target.phoneNumber || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-text-muted mb-0.5">Address</p>
                <p className="font-semibold text-text-main">
                  {target.profile?.address || "N/A"},{" "}
                  {target.profile?.city || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-main bg-neutral-50/50 flex justify-end sticky bottom-0 z-10 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-text-inverse text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
