import {
  CheckCircle2,
  X,
  User,
  FileText,
  Link as LinkIcon,
  ShieldAlert,
  DollarSign,
} from "lucide-react";
import { imageUrl } from "../../../../utils/image";

export default function DetailsModal({ target, onClose }) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Resolved
              Dispute #{target.id}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Sale #{target.saleId} · Product #{target.productId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Parties Involved
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Raised By
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${target.raisedByRole === "Seller" ? "bg-orange-500" : "bg-blue-500"}`}
                  >
                    {target.raisedByName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {target.raisedByName}
                    </p>
                    <span
                      className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${target.raisedByRole === "Buyer" ? "bg-blue-100 text-blue-700" : target.raisedByRole === "Seller" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {target.raisedByRole}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:border-l md:border-gray-100 md:pl-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Raised Against
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${target.againstRole === "Seller" ? "bg-orange-500" : "bg-blue-500"}`}
                  >
                    {target.againstName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {target.againstName}
                    </p>
                    <span
                      className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${target.againstRole === "Buyer" ? "bg-blue-100 text-blue-700" : target.againstRole === "Seller" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {target.againstRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-500" /> Original Complaint
            </h3>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {target.complaint}
            </div>
          </div>

          {target.evidenceUrl && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <LinkIcon className="w-4 h-4 text-gray-500" /> Submitted
                Evidence
              </h3>
              <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 inline-block">
                <img
                  src={imageUrl(target.evidenceUrl)}
                  alt="Dispute Evidence"
                  className="max-h-48 rounded-lg object-contain cursor-zoom-in hover:opacity-90 transition"
                  onClick={() =>
                    window.open(imageUrl(target.evidenceUrl), "_blank")
                  }
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-green-600" /> Admin Decision
            </h3>
            <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-900 leading-relaxed font-medium">
                "{target.adminDecision || "No decision recorded."}"
              </p>
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-green-200">
                Decided By Admin ID:{" "}
                <span className="font-mono">
                  {target.decidedBy || "Unknown"}
                </span>
              </p>
            </div>
          </div>

          {target.penalty && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mt-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-gray-600" /> Penalty
                Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Total Forfeited</p>
                  <p className="font-bold text-gray-900">
                    ${target.penalty.totalAmount?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">
                    To Opposite Party
                  </p>
                  <p className="font-bold text-green-600">
                    ${target.penalty.oppositePartyAmount?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">To Platform</p>
                  <p className="font-bold text-purple-600">
                    ${target.penalty.platformAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Penalty applied against User ID:{" "}
                <span className="font-mono font-bold">
                  {target.penalty.againstUserId}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end sticky bottom-0 z-10 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
