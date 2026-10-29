import { X, Gavel, ArrowUp, Users } from "lucide-react";
import { SkeletonRow } from "../../../../components/Skeleton";

export default function BidsModal({ bidsData, bidsLoading, onClose }) {
  if (!bidsData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-purple-600" />
              Auction Bids
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
              {bidsData.productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-purple-50/50 border-b border-purple-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p
              className={`text-sm font-bold ${
                bidsData.auctionStatus === "Active"
                  ? "text-green-700"
                  : "text-gray-700"
              }`}
            >
              {bidsData.auctionStatus}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Bids</p>
            <p className="text-sm font-bold text-gray-900">
              {bidsData.bidCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Highest</p>
            <p className="text-sm font-bold text-green-700">
              {bidsData.currentHighestBid != null
                ? `৳${bidsData.currentHighestBid.toLocaleString()}`
                : "None"}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {bidsLoading ? (
            <div className="p-6 space-y-3">
              <SkeletonRow cols={3} />
              <SkeletonRow cols={3} />
              <SkeletonRow cols={3} />
            </div>
          ) : bidsData.bids && bidsData.bids.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Bidder</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium">Placed At</th>
                  <th className="px-6 py-3 font-medium text-center">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bidsData.bids.map((b) => (
                  <tr
                    key={b.bidId}
                    className={
                      b.isHighest
                        ? "bg-green-50 hover:bg-green-100"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {b.bidderName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {b.bidderEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-blue-600">
                      ৳{b.amount?.toLocaleString()}
                      {b.isBuyout && (
                        <span className="ml-1 text-[10px] font-semibold text-purple-700">
                          (buyout)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {new Date(b.placedAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {b.isHighest ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <ArrowUp className="w-3 h-3" />
                          Highest
                        </span>
                      ) : b.isBuyout ? (
                        <span className="text-[10px] font-semibold text-purple-600">
                          Buyout
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">
                          Outbid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No bids have been placed yet.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
