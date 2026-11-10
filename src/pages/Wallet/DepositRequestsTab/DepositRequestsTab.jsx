import { ArrowDownToLine } from "lucide-react";

export default function DepositRequestsTab({
  depositRequests,
  onRequestDeposit,
  formatMoney,
  formatDate,
}) {
  if (depositRequests.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <ArrowDownToLine className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="font-medium">No deposit requests yet.</p>
        <p className="text-xs text-neutral-400 mt-1">
          Submit a deposit request to add funds to your wallet.
        </p>
        <button
          onClick={onRequestDeposit}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-text-inverse text-sm font-semibold rounded-lg"
        >
          <ArrowDownToLine className="w-4 h-4" /> Request Deposit
        </button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border-main">
      {depositRequests.map((d) => (
        <li key={d.id} className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${d.status === "Approved" ? "bg-success-50 text-success-600" : d.status === "Rejected" ? "bg-danger-50 text-danger-600" : "bg-warning-50 text-warning-600"}`}
              >
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-text-main text-sm">
                  {d.method} — {formatMoney(d.amount)}
                </p>
                <p className="text-xs text-text-muted">
                  Ref: {d.transactionReference}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Submitted {formatDate(d.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${d.status === "Approved" ? "bg-success-100 text-success-700" : d.status === "Rejected" ? "bg-danger-100 text-danger-700" : "bg-warning-100 text-warning-700"}`}
              >
                {d.status}
              </span>
            </div>
          </div>
          {d.status === "Rejected" && d.rejectionReason && (
            <p className="mt-2 text-xs text-danger-600 bg-danger-50 rounded-lg p-2">
              <strong>Reason:</strong> {d.rejectionReason}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
