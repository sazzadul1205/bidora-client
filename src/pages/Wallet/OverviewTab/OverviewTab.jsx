import { ArrowDownToLine, ArrowUpRight, Lock, History } from "lucide-react";

export default function OverviewTab({
  depositRequests,
  transactions,
  reservations,
  onRequestDeposit,
  onViewAllDeposits,
  onViewAllTransactions,
  onViewAllReservations,
  formatMoney,
  getTxColor,
}) {
  return (
    <div className="space-y-6">
      {/* Recent deposit requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Recent Deposit Requests
          </h3>
          <button
            onClick={onViewAllDeposits}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            View all
          </button>
        </div>
        {depositRequests.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-500">No deposit requests yet.</p>
            <button
              onClick={onRequestDeposit}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> Request Deposit
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {depositRequests.slice(0, 3).map((d) => (
              <li
                key={d.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
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
                    <p className="text-sm font-medium text-gray-900">
                      {d.method} — {formatMoney(d.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ref: {d.transactionReference}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    d.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : d.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Recent Transactions
          </h3>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            View all
          </button>
        </div>
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No transactions yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {transactions.slice(0, 3).map((tx) => (
              <li
                key={tx.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTxColor(tx.type)}`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.reference || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.type === "Debit" || tx.type === "Penalty"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {tx.type === "Debit" || tx.type === "Penalty" ? "-" : "+"}
                    {formatMoney(tx.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Active reservations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Active Reservations
          </h3>
          <button
            onClick={onViewAllReservations}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            View all
          </button>
        </div>
        {reservations.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <Lock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No active reservations.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {reservations.slice(0, 3).map((r) => (
              <li
                key={r.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {r.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.productTitle || `Reservation #${r.id}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">
                    {formatMoney(r.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
