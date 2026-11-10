import { useRef, useState } from "react";
import { Scale, X, ImagePlus, AlertCircle } from "lucide-react";
import { toast } from "../../../../../utils/toast";
import { createDisputeImage } from "../../../../../services/sellerApi";

export default function RaiseDisputeModal({ target, onClose, onSuccess }) {
  const [complaint, setComplaint] = useState("");
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [evidenceImagePreview, setEvidenceImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!target) {
    return null;
  }

  const clearImage = () => {
    if (evidenceImagePreview) {
      URL.revokeObjectURL(evidenceImagePreview);
    }
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
    if (evidenceImagePreview) {
      URL.revokeObjectURL(evidenceImagePreview);
    }
    setEvidenceImage(file);
    setEvidenceImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    setComplaint("");
    clearImage();
    onClose();
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
      formData.append("SaleId", target.id);
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
      toast.error(err.response?.data?.message || "Failed to submit dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-danger-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Scale className="w-5 h-5 text-danger-600" /> Raise Dispute
            </h2>
            <p className="text-xs text-text-muted mt-0.5 truncate max-w-68">
              {target.productTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-danger-50 text-danger-800 p-3 rounded-lg border border-danger-100 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Disputes can only be raised for sales that have been paid or have
              overdue payments. Once submitted, an admin will review your
              complaint and may apply a penalty to the responsible party.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Describe the issue <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={4}
              placeholder="e.g. The buyer never paid, the item was returned damaged..."
              className="w-full px-3 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-danger-500 outline-none resize-none"
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
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="border-2 border-dashed border-border-main rounded-lg p-4 text-center hover:border-danger-400 hover:bg-danger-50/30 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
              <p className="text-xs text-text-muted">
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
              <div className="relative mt-3">
                <img
                  src={evidenceImagePreview}
                  alt="preview"
                  className="w-24 h-24 rounded-lg object-cover border border-border-main shadow-sm"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-1 -right-1 bg-danger-600 text-text-inverse rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-danger-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || complaint.trim().length < 20}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-text-inverse text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Scale className="w-4 h-4" /> Submit Dispute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
