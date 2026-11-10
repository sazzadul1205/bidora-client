import { useRef, useState } from "react";
import {
  CheckCircle,
  X,
  UploadCloud,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "../../../../../utils/toast";
import { confirmReceipt } from "../../../../../services/buyerApi";

export default function ConfirmReceiptModal({
  target,
  onClose,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}) {
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState(null);
  const [receiptNotes, setReceiptNotes] = useState("");
  const receiptInputRef = useRef(null);

  if (!target) {
    return null;
  }

  const clearImage = () => {
    if (receiptImagePreview) {
      URL.revokeObjectURL(receiptImagePreview);
    }
    setReceiptImage(null);
    setReceiptImagePreview(null);
    if (receiptInputRef.current) {
      receiptInputRef.current.value = "";
    }
  };

  const handleFile = (file) => {
    if (!file) {
      return;
    }
    if (receiptImagePreview) {
      URL.revokeObjectURL(receiptImagePreview);
    }
    setReceiptImage(file);
    setReceiptImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!receiptImage) {
      return toast.error("Proof of receipt image is required.");
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("ReceiptProofImage", receiptImage);
      if (receiptNotes.trim()) {
        formData.append("ReceiptNotes", receiptNotes.trim());
      }
      await confirmReceipt(target.saleId, formData);
      toast.success("Receipt confirmed. Funds released to seller.");
      clearImage();
      setReceiptNotes("");
      onClose();
      await onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm receipt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-success-50/50">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success-600" /> Confirm
              Receipt
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

        <div className="p-6 space-y-4">
          <div className="bg-success-50 text-success-800 p-3 rounded-lg border border-success-100 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Confirming receipt releases the escrow funds to the seller. You
              must upload a photo as proof of delivery.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Upload Proof of Receipt <span className="text-danger-500">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="border-2 border-dashed border-border-main rounded-lg p-6 text-center hover:border-success-400 hover:bg-success-50/30 transition-colors cursor-pointer"
              onClick={() => receiptInputRef.current?.click()}
            >
              <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-text-main">
                Drop a photo here or click to browse
              </p>
              <p className="text-xs text-text-muted mt-1">
                JPG, PNG, WEBP · Max 5 MB
              </p>
              <input
                ref={receiptInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            {receiptImagePreview && (
              <div className="relative mt-3 inline-block">
                <img
                  src={receiptImagePreview}
                  alt="preview"
                  className="h-32 rounded-lg object-contain border border-border-main shadow-sm bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-danger-600 text-text-inverse rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-danger-700 shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Notes (optional)
            </label>
            <textarea
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Item received in good condition..."
              className="w-full px-3 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-success-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !receiptImage}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-success-600 hover:bg-success-700 text-text-inverse text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{" "}
              Confirm & Release Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
