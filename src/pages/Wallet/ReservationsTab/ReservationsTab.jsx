import { Lock } from "lucide-react";

export default function ReservationsTab({ reservations, formatMoney }) {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <Lock className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="font-medium">No active reservations.</p>
        <p className="text-xs text-neutral-400 mt-1">
          Funds are locked when you bid or list a product.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border-main">
      {reservations.map((r) => (
        <li key={r.id} className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning-50 text-warning-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-text-main text-sm">{r.type}</p>
              <p className="text-xs text-text-muted">
                {r.productTitle || `Reservation #${r.id}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-warning-600">
              {formatMoney(r.amount)}
            </p>
            <span
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "Reserved" ? "bg-warning-100 text-warning-700" : "bg-neutral-100 text-neutral-600"}`}
            >
              {r.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
