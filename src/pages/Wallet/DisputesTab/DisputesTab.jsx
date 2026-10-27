import { Scale, TrendingUp, TrendingDown } from "lucide-react";

export default function DisputesTab({
  disputeTransactions,
  formatMoney,
  formatDate,
  getTxColor,
}) {
  if (disputeTransactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-medium">No dispute history.</p>
        <p className="text-xs text-gray-400 mt-1">
          Penalties and compensations from resolved disputes will appear here.
        </p>
      </div>
    );
  }

  // Calculate Totals
  const totalPenalties = disputeTransactions
    .filter((tx) => tx.type === "Penalty")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalGained = disputeTransactions
    .filter((tx) => tx.type === "Credit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800 mb-1">Total Penalized</p>
            <p className="text-2xl font-bold text-red-700">
              {formatMoney(totalPenalties)}
            </p>
          </div>
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800 mb-1">Total Recovered</p>
            <p className="text-2xl font-bold text-green-700">
              {formatMoney(totalGained)}
            </p>
          </div>
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Dispute Transactions
        </h3>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {disputeTransactions.map((tx) => (
            <li
              key={tx.id}
              className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTxColor(tx.type)}`}>
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{tx.type}</p>
                  <p className="text-xs text-gray-500 max-w-xs truncate">
                    {tx.reference || "—"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${tx.type === "Debit" || tx.type === "Penalty"
                      ? "text-red-600"
                      : "text-green-600"
                    }`}
                >
                  {tx.type === "Debit" || tx.type === "Penalty" ? "-" : "+"}
                  {formatMoney(tx.amount)}
                </p>
                <p className="text-xs text-gray-400">
                  Bal: {formatMoney(tx.balanceAfter)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}