import { ArrowDownToLine } from "lucide-react";

export default function DepositRequestsTab({
  depositRequests,
  onRequestDeposit,
  formatMoney,
  formatDate,
}) {
  if (depositRequests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ArrowDownToLine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-medium">No deposit requests yet.</p>
        <p className="text-xs text-gray-400 mt-1">
          Submit a deposit request to add funds to your wallet.
        </p>
        <button
          onClick={onRequestDeposit}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
        >
          <ArrowDownToLine className="w-4 h-4" /> Request Deposit
        </button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {depositRequests.map((d) => (
        <li key={d.id} className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  d.status === "Approved"
                    ? "bg-green-50 text-green-600"
                    : d.status === "Rejected"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                }`}
              >
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {d.method} — {formatMoney(d.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  Ref: {d.transactionReference}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Submitted {formatDate(d.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                  d.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : d.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {d.status}
              </span>
            </div>
          </div>
          {d.status === "Rejected" && d.rejectionReason && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
              <strong>Reason:</strong> {d.rejectionReason}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
