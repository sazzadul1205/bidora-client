import { ArrowUpRight, History } from "lucide-react";

export default function TransactionsTab({
  transactions,
  formatMoney,
  formatDate,
  getTxColor,
}) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <History className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="font-medium">No transactions yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border-main">
      {transactions.map((tx) => (
        <li
          key={tx.id}
          className="py-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTxColor(tx.type)}`}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-text-main text-sm">{tx.type}</p>
              <p className="text-xs text-text-muted">{tx.reference || "—"}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {formatDate(tx.createdAt)}
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
            <p className="text-xs text-neutral-400">
              Bal: {formatMoney(tx.balanceAfter)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
