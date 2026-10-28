import { Truck, X, FileText, ImagePlus } from "lucide-react";
import { imageUrl, handleImageError } from "../../../../../utils/image";

export default function DispatchDetailsModal({ target, onClose }) {
  if (!target) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" /> Dispatch Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
              {target.productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" /> Dispatch
              Information
            </h3>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
              {target.dispatchInfo || "No dispatch info provided."}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <ImagePlus className="w-4 h-4 text-gray-500" /> Tracking Evidence
            </h3>
            {target.trackingEvidence ? (
              <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 flex justify-center">
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
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center text-gray-500 text-sm">
                No tracking evidence uploaded.
              </div>
            )}
            <p className="text-xs text-gray-400 text-center mt-2">
              Click image to open full size
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end rounded-b-2xl">
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
