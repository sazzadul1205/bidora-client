import { useRef, useState } from "react";
import { Truck, X, AlertCircle, UploadCloud, Loader2 } from "lucide-react";
import { toast } from "../../../../../utils/toast";
import { dispatchSale } from "../../../../../services/sellerApi";

export default function DispatchSaleModal({ target, onClose, onSuccess }) {
  const [dispatchInfo, setDispatchInfo] = useState("");
  const [dispatchInfoError, setDispatchInfoError] = useState("");
  const [trackingImage, setTrackingImage] = useState(null);
  const [trackingImagePreview, setTrackingImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trackingInputRef = useRef(null);

  if (!target) return null;

  const clearImage = () => {
    if (trackingImagePreview) URL.revokeObjectURL(trackingImagePreview);
    setTrackingImage(null);
    setTrackingImagePreview(null);
    if (trackingInputRef.current) trackingInputRef.current.value = "";
  };

  const handleFile = (file) => {
    if (!file) return;
    if (trackingImagePreview) URL.revokeObjectURL(trackingImagePreview);
    setTrackingImage(file);
    setTrackingImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setDispatchInfo("");
    setDispatchInfoError("");
    clearImage();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dispatchInfo.trim()) {
      setDispatchInfoError("Dispatch info is required");
      return;
    }
    setDispatchInfoError("");

    if (!trackingImage) {
      toast.error("Please upload a tracking evidence image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("DispatchInfo", dispatchInfo.trim());
      formData.append("TrackingEvidenceImage", trackingImage);

      await dispatchSale(target.id, formData);

      toast.success("Item dispatched successfully");
      resetForm();
      onClose();
      await onSuccess();
    } catch (err) {
      toast.error(
        "Failed to dispatch: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Dispatch Item</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
              {target.productTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 flex items-start gap-2 text-sm mb-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Please dispatch the item within <strong>5 days</strong> of
              payment. The buyer has 3 days to confirm receipt after dispatch.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispatch Information <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Truck className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={dispatchInfo}
                onChange={(e) => {
                  setDispatchInfo(e.target.value);
                  if (dispatchInfoError) setDispatchInfoError("");
                }}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition ${
                  dispatchInfoError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Pathao Courier, Tracking: 12345678"
              />
            </div>
            {dispatchInfoError && (
              <p className="text-xs text-red-600 mt-1">{dispatchInfoError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Tracking Evidence <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
              onClick={() => trackingInputRef.current?.click()}
            >
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Drop a photo here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WEBP · Max 5 MB
              </p>
              <input
                ref={trackingInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            {trackingImagePreview && (
              <div className="relative mt-3 inline-block">
                <img
                  src={trackingImagePreview}
                  alt="preview"
                  className="h-24 rounded-lg object-contain border border-gray-200 shadow-sm bg-gray-50"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !trackingImage}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Confirming..." : "Confirm Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
