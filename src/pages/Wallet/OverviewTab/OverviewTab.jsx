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
          <h3 className="text-sm font-semibold text-text-main">
            Recent Deposit Requests
          </h3>
          <button
            onClick={onViewAllDeposits}
            className="text-xs font-medium text-primary-600 hover:text-primary-800"
          >
            View all
          </button>
        </div>
        {depositRequests.length === 0 ? (
          <div className="rounded-xl border border-border-main bg-surface p-6 text-center">
            <p className="text-sm text-text-muted">No deposit requests yet.</p>
            <button
              onClick={onRequestDeposit}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-text-inverse text-xs font-semibold rounded-lg"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> Request Deposit
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border-main rounded-xl border border-border-main bg-surface overflow-hidden">
            {depositRequests.slice(0, 3).map((d) => (
              <li
                key={d.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${d.status === "Approved" ? "bg-success-50 text-success-600" : d.status === "Rejected" ? "bg-danger-50 text-danger-600" : "bg-warning-50 text-warning-600"}`}
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-main">
                      {d.method} — {formatMoney(d.amount)}
                    </p>
                    <p className="text-xs text-text-muted">
                      Ref: {d.transactionReference}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${d.status === "Approved" ? "bg-success-100 text-success-700" : d.status === "Rejected" ? "bg-danger-100 text-danger-700" : "bg-warning-100 text-warning-700"}`}
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
          <h3 className="text-sm font-semibold text-text-main">
            Recent Transactions
          </h3>
          <button
            onClick={onViewAllTransactions}
            className="text-xs font-medium text-primary-600 hover:text-primary-800"
          >
            View all
          </button>
        </div>
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-border-main bg-surface p-6 text-center">
            <History className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-text-muted">No transactions yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-main rounded-xl border border-border-main bg-surface overflow-hidden">
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
                    <p className="text-sm font-medium text-text-main">
                      {tx.type}
                    </p>
                    <p className="text-xs text-text-muted">
                      {tx.reference || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${tx.type === "Debit" || tx.type === "Penalty" ? "text-danger-600" : "text-success-600"}`}
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
          <h3 className="text-sm font-semibold text-text-main">
            Active Reservations
          </h3>
          <button
            onClick={onViewAllReservations}
            className="text-xs font-medium text-primary-600 hover:text-primary-800"
          >
            View all
          </button>
        </div>
        {reservations.length === 0 ? (
          <div className="rounded-xl border border-border-main bg-surface p-6 text-center">
            <Lock className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-text-muted">No active reservations.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-main rounded-xl border border-border-main bg-surface overflow-hidden">
            {reservations.slice(0, 3).map((r) => (
              <li
                key={r.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning-50 text-warning-600">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-main">
                      {r.type}
                    </p>
                    <p className="text-xs text-text-muted">
                      {r.productTitle || `Reservation #${r.id}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-warning-600">
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
