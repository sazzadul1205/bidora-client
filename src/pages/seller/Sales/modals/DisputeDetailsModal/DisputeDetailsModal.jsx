import { useEffect, useState } from "react";
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
import { getDisputeById } from "../../../../../services/sellerApi";
import MessageThread from "../../../../../components/DisputeMessageThread/MessageThread";

export default function DisputeDetailsModal({ dispute, onClose }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!dispute) { return; }
    getDisputeById(dispute.id)
      .then((res) => setDetails(res.data.data))
      .catch(console.error);
  }, [dispute]);

  if (!dispute) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentStatus = details?.status || dispute.status;
  const isPending = currentStatus === "UnderReview" || currentStatus === "Open";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50 sticky top-0 z-10">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-text-main" /> Dispute
              #{dispute.id}
            </h2>
            <p className="text-[11px] sm:text-xs text-text-muted mt-0.5">
              Opened on {formatDate(dispute.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1">
          {isPending ? (
            <div className="bg-warning-50 border border-warning-200 text-warning-800 p-3 sm:p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">{currentStatus === "Open" ? "Dispute Open" : "Pending Admin Review"}</h3>
                <p className="text-sm mt-1">
                  {currentStatus === "Open"
                    ? "Your dispute has been submitted. An administrator will start reviewing it soon."
                    : "An administrator is currently reviewing this dispute. You will be notified once a decision is made."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-danger-50 border border-danger-200 text-danger-800 p-3 sm:p-4 rounded-xl flex items-start gap-3">
              <Gavel className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Dispute {currentStatus === "Resolved" ? "Resolved" : "Closed"}</h3>
                <p className="text-sm mt-1">
                  The admin has reviewed this case and made a final decision.
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-2 sm:mb-3">
              <MessageSquare className="w-4 h-4 text-text-muted" /> Your
              Complaint
            </h3>
            <div className="bg-neutral-50 border border-border-main p-3 sm:p-4 rounded-xl text-sm text-text-main leading-relaxed whitespace-pre-wrap wrap-break-word">
              {dispute.complaint}
            </div>
          </div>

          {dispute.evidenceUrl && (
            <div>
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-2 sm:mb-3">
                <FileText className="w-4 h-4 text-text-muted" /> Submitted
                Evidence
              </h3>
              <div className="border border-border-main rounded-xl p-2 bg-neutral-50 inline-block max-w-full">
                <img
                  src={imageUrl(dispute.evidenceUrl)}
                  alt="Dispute Evidence"
                  onError={handleImageError}
                  className="max-h-48 sm:max-h-64 max-w-full rounded-lg object-contain cursor-zoom-in hover:opacity-90 transition"
                  onClick={() =>
                    window.open(imageUrl(dispute.evidenceUrl), "_blank")
                  }
                />
              </div>
            </div>
          )}
          {(details?.status || dispute.status) === "Resolved" && (details?.adminDecision || dispute.adminDecision) && (
            <div>
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-2 sm:mb-3">
                <ShieldAlert className="w-4 h-4 text-danger-600" /> Admin
                Decision
              </h3>
              <div className="bg-surface border-2 border-danger-200 p-3 sm:p-4 rounded-xl shadow-sm">
                <p className="text-sm text-text-main leading-relaxed font-medium wrap-break-word">
                  "{details?.adminDecision || dispute.adminDecision}"
                </p>
              </div>
            </div>
          )}
          {(details?.penalty || dispute.penalty) && (() => {
            const p = details?.penalty || dispute.penalty;
            return (
              <div className="bg-danger-50/50 rounded-xl border border-danger-100 p-3 sm:p-5 mt-3 sm:mt-4">
                <h3 className="text-sm font-bold text-danger-900 flex items-center gap-2 mb-2 sm:mb-3">
                  <DollarSign className="w-4 h-4 text-danger-600" /> Penalty Breakdown
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center border-b border-danger-100 pb-2 gap-2">
                    <span className="text-text-muted">Total Forfeited:</span>
                    <span className="font-bold text-text-main whitespace-nowrap">৳{p.totalAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-danger-100 pb-2 gap-2">
                    <span className="text-text-muted">To Opposite Party (80%):</span>
                    <span className="font-bold text-success-700 whitespace-nowrap">+৳{p.oppositePartyAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-text-muted">Platform Fee (20%):</span>
                    <span className="font-bold text-neutral-500 whitespace-nowrap">৳{p.platformAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* NEW MESSAGE THREAD */}
          {details && (
            <MessageThread
              disputeId={dispute.id}
              canSend={details.canSendMessages}
              status={details.status}
            />
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border-main bg-neutral-50/50 flex justify-between items-center sticky bottom-0 z-10 rounded-b-2xl gap-2">
          <div>
            {(details?.status || dispute.status) === "Resolved" && (
              <button
                disabled
                className="text-[10px] sm:text-xs font-semibold text-neutral-400 bg-neutral-100 px-2.5 sm:px-3 py-1.5 rounded border border-border-main cursor-not-allowed flex items-center gap-1.5"
                title="Coming soon"
              >
                <Scale className="w-3 h-3" /> Challenge
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-neutral-900 hover:bg-black text-text-inverse text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}