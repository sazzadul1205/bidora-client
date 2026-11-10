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
  if (!target) {return null;}

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success-600" /> Resolved
              Dispute #{target.id}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Sale #{target.saleId} · Product #{target.productId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1">
          <div className="bg-neutral-50 rounded-xl border border-border-main p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wide">
                Parties Involved
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-surface p-4 rounded-lg border border-border-main">
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Raised By
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-text-inverse shadow-sm ${target.raisedByRole === "Seller" ? "bg-warning-500" : "bg-primary-500"}`}
                  >
                    {target.raisedByName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-text-main">
                      {target.raisedByName}
                    </p>
                    <span
                      className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        target.raisedByRole === "Buyer"
                          ? "bg-primary-100 text-primary-700"
                          : target.raisedByRole === "Seller"
                            ? "bg-warning-100 text-warning-700"
                            : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {target.raisedByRole}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:border-l md:border-border-main md:pl-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Raised Against
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-text-inverse shadow-sm ${target.againstRole === "Seller" ? "bg-warning-500" : "bg-primary-500"}`}
                  >
                    {target.againstName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-bold text-text-main">
                      {target.againstName}
                    </p>
                    <span
                      className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        target.againstRole === "Buyer"
                          ? "bg-primary-100 text-primary-700"
                          : target.againstRole === "Seller"
                            ? "bg-warning-100 text-warning-700"
                            : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {target.againstRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-text-muted" /> Original
              Complaint
            </h3>
            <div className="bg-neutral-50 border border-border-main p-4 rounded-xl text-sm text-text-main leading-relaxed whitespace-pre-wrap">
              {target.complaint}
            </div>
          </div>

          {target.evidenceUrl && (
            <div>
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
                <LinkIcon className="w-4 h-4 text-text-muted" /> Submitted
                Evidence
              </h3>
              <div className="border border-border-main rounded-xl p-2 bg-neutral-50 inline-block">
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
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-success-600" /> Admin
              Decision
            </h3>
            <div className="bg-success-50 border-2 border-success-200 p-4 rounded-xl shadow-sm">
              <p className="text-sm text-text-main leading-relaxed font-medium">
                "{target.adminDecision || "No decision recorded."}"
              </p>
              <p className="text-xs text-text-muted mt-3 pt-3 border-t border-success-200">
                Decided By Admin ID:{" "}
                <span className="font-mono">
                  {target.decidedBy || "Unknown"}
                </span>
              </p>
            </div>
          </div>

          {target.penalty && (
            <div className="bg-neutral-50 rounded-xl border border-border-main p-5 mt-2">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-neutral-600" /> Penalty
                Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-surface p-3 rounded-lg border border-border-main">
                  <p className="text-xs text-text-muted mb-1">
                    Total Forfeited
                  </p>
                  <p className="font-bold text-text-main">
                    ${target.penalty.totalAmount?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-border-main">
                  <p className="text-xs text-text-muted mb-1">
                    To Opposite Party
                  </p>
                  <p className="font-bold text-success-600">
                    ${target.penalty.oppositePartyAmount?.toFixed(2)}
                  </p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-border-main">
                  <p className="text-xs text-text-muted mb-1">To Platform</p>
                  <p className="font-bold text-accent-600">
                    ${target.penalty.platformAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-3 text-center">
                Penalty applied against User ID:{" "}
                <span className="font-mono font-bold">
                  {target.penalty.againstUserId}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-main bg-neutral-50/50 flex justify-end sticky bottom-0 z-10 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-text-inverse text-sm font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
