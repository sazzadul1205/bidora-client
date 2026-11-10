import { Truck, X, FileText, ImagePlus } from "lucide-react";
import { imageUrl, handleImageError } from "../../../../../utils/image";

export default function DispatchDetailsModal({ target, onClose }) {
  if (!target) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-accent-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent-600" /> Dispatch Details
            </h2>
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-68">
              {target.productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-text-muted" /> Dispatch
              Information
            </h3>
            <div className="bg-neutral-50 border border-border-main p-4 rounded-xl text-sm text-text-main leading-relaxed whitespace-pre-wrap font-medium">
              {target.dispatchInfo || "No dispatch info provided."}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-2">
              <ImagePlus className="w-4 h-4 text-text-muted" /> Tracking
              Evidence
            </h3>
            {target.trackingEvidence ? (
              <div className="border border-border-main rounded-xl p-2 bg-neutral-50 flex justify-center">
                <img
                  src={imageUrl(target.trackingEvidence)}
                  alt="Tracking Evidence"
                  onError={handleImageError}
                  className="max-h-72 rounded-lg object-contain cursor-zoom-in hover:opacity-90 transition"
                  onClick={() =>
                    window.open(imageUrl(target.trackingEvidence), "_blank")
                  }
                />
              </div>
            ) : (
              <div className="bg-neutral-50 border border-border-main p-4 rounded-xl text-center text-text-muted text-sm">
                No tracking evidence uploaded.
              </div>
            )}
            <p className="text-xs text-neutral-400 text-center mt-2">
              Click image to open full size
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-main bg-neutral-50/50 flex justify-end rounded-b-2xl">
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
