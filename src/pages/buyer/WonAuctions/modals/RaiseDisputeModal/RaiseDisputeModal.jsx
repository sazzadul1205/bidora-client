import { useEffect, useRef, useState } from "react";
import { Scale, X, ImagePlus, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "../../../../../utils/toast";
import { createDisputeImage } from "../../../../../services/buyerApi";

export default function RaiseDisputeModal({
  target,
  onClose,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}) {
  const [complaint, setComplaint] = useState("");
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [evidenceImagePreview, setEvidenceImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Revoke the preview URL whenever it changes or on unmount
  useEffect(() => {
    return () => {
      if (evidenceImagePreview) {
        URL.revokeObjectURL(evidenceImagePreview);
      }
    };
  }, [evidenceImagePreview]);

  if (!target) {
    return null;
  }

  const clearImage = () => {
    setEvidenceImage(null);
    setEvidenceImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = (file) => {
    if (!file) {
      return;
    }
    setEvidenceImage(file);
    setEvidenceImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!complaint.trim()) {
      return toast.error("Please describe the issue.");
    }
    if (complaint.trim().length < 20) {
      return toast.error(
        "Please provide more detail (at least 20 characters).",
      );
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("SaleId", target.saleId);
      formData.append("Complaint", complaint.trim());
      if (evidenceImage) {
        formData.append("EvidenceImage", evidenceImage);
      }
      await createDisputeImage(formData);

      toast.success("Dispute submitted. Awaiting admin review.");
      setComplaint("");
      clearImage();
      onClose();
      await onSuccess();
    } catch (err) {
      toast.errorFrom(err, "Failed to submit dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-main flex items-center justify-between bg-danger-50/50 sticky top-0 z-10">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-danger-600" /> Raise
              Dispute
            </h2>
            <p className="text-[11px] sm:text-xs text-text-muted mt-0.5 truncate">
              {target.productTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 sm:p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="bg-danger-50 text-danger-800 p-3 rounded-lg border border-danger-100 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
            <p>
              Disputes are reviewed by an admin. Provide clear evidence. False
              claims may result in penalties.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Describe the issue <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              placeholder="e.g. The item arrived damaged, or the seller never dispatched it..."
              className="w-full px-3 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-danger-500 outline-none resize-none disabled:opacity-60"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Minimum 20 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Upload Photo (optional)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!isSubmitting) {
                  handleFile(e.dataTransfer.files?.[0]);
                }
              }}
              className={`border-2 border-dashed border-border-main rounded-lg p-3 sm:p-4 text-center transition-colors ${
                isSubmitting
                  ? "cursor-not-allowed opacity-60"
                  : "hover:border-danger-400 hover:bg-danger-50/30 cursor-pointer"
              }`}
              onClick={() => {
                if (!isSubmitting) {
                  fileInputRef.current?.click();
                }
              }}
            >
              <ImagePlus className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-400 mx-auto mb-1" />
              <p className="text-[11px] sm:text-xs text-text-muted">
                Drop a photo here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            {evidenceImagePreview && (
              <div className="relative mt-3 inline-block">
                <img
                  src={evidenceImagePreview}
                  alt="preview"
                  className="w-20 sm:w-24 h-20 sm:h-24 rounded-lg object-cover border border-border-main shadow-sm"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  disabled={isSubmitting}
                  className="absolute -top-1 -right-1 bg-danger-600 text-text-inverse rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-danger-700 disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-border-main">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || complaint.trim().length < 20}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-text-inverse text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Dispute"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
