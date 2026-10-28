import {
  Scale,
  X,
  ShieldAlert,
  MessageSquare,
  FileText,
  Gavel,
  DollarSign,
} from "lucide-react";
import { imageUrl, handleImageError } from "../../../../../utils/image";

export default function DisputeDetailsModal({ dispute, onClose }) {
  if (!dispute) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPending =
    dispute.status === "UnderReview" || dispute.status === "Open";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-gray-700" /> Dispute #{dispute.id}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Opened on {formatDate(dispute.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {isPending ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Pending Admin Review</h3>
                <p className="text-sm mt-1">
                  An administrator is currently reviewing this dispute. You will
                  be notified once a decision is made.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
              <Gavel className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Dispute Resolved</h3>
                <p className="text-sm mt-1">
                  The admin has reviewed this case and made a final decision.
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-500" /> Complaint
            </h3>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {dispute.complaint}
            </div>
          </div>

          {dispute.evidenceUrl && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" /> Submitted
                Evidence
              </h3>
              <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 inline-block">
                <img
                  src={imageUrl(dispute.evidenceUrl)}
                  alt="Dispute Evidence"
                  onError={handleImageError}
                  className="max-h-64 rounded-lg object-contain cursor-zoom-in hover:opacity-90 transition"
                  onClick={() =>
                    window.open(imageUrl(dispute.evidenceUrl), "_blank")
                  }
                />
                <p className="text-center text-xs text-gray-500 mt-2">
                  Click to open full image
                </p>
              </div>
            </div>
          )}

          {dispute.status === "Resolved" && dispute.adminDecision && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Admin Decision
              </h3>
              <div className="bg-white border-2 border-red-200 p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-900 leading-relaxed font-medium">
                  "{dispute.adminDecision}"
                </p>
              </div>
            </div>
          )}

          {dispute.penalty && (
            <div className="bg-red-50/50 rounded-xl border border-red-100 p-5 mt-4">
              <h3 className="text-sm font-bold text-red-900 flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-red-600" /> Penalty
                Breakdown
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-red-100 pb-2">
                  <span className="text-gray-600">
                    Total Deposit Forfeited:
                  </span>
                  <span className="font-bold text-gray-900">
                    ${dispute.penalty.totalAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-red-100 pb-2">
                  <span className="text-gray-600">
                    Sent to Opposite Party (80%):
                  </span>
                  <span className="font-bold text-green-700">
                    +${dispute.penalty.oppositePartyAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Platform Fee (20%):</span>
                  <span className="font-bold text-gray-500">
                    ${dispute.penalty.platformAmount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center sticky bottom-0 z-10 rounded-b-2xl">
          <div>
            {dispute.status === "Resolved" && (
              <button
                disabled
                className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded border border-gray-200 cursor-not-allowed flex items-center gap-1.5"
                title="Coming soon"
              >
                <Scale className="w-3 h-3" /> Challenge Decision
              </button>
            )}
          </div>
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
