import { Lock } from "lucide-react";

export default function ReservationsTab({ reservations, formatMoney }) {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-medium">No active reservations.</p>
        <p className="text-xs text-gray-400 mt-1">
          Funds are locked when you bid or list a product.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {reservations.map((r) => (
        <li key={r.id} className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{r.type}</p>
              <p className="text-xs text-gray-500">
                {r.productTitle || `Reservation #${r.id}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-orange-600">
              {formatMoney(r.amount)}
            </p>
            <span
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                r.status === "Reserved"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {r.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
