import { useForm, useWatch } from "react-hook-form";
import {
  Tag,
  DollarSign,
  FileText,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { imageUrl, handleImageError } from "../../../../utils/image";

export default function ReviewModal({
  selectedProduct,
  onClose,
  onSubmit,
  submitting,
  zoomImage,
  setZoomImage,
}) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { status: "Approved" },
  });
  const actionStatus = useWatch({ control, name: "status" });

  if (!selectedProduct) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
          <div className="sticky top-0 bg-surface border-b border-border-main px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-text-main">
                Review Product
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Product ID: #{selectedProduct.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">
                Product Images
              </h3>
              {selectedProduct.images?.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {selectedProduct.images.map((img) => (
                    <img
                      key={img.id}
                      src={imageUrl(img.imageUrl)}
                      alt="Product"
                      onError={handleImageError}
                      onClick={() => setZoomImage(imageUrl(img.imageUrl))}
                      className="w-32 h-32 object-cover rounded-xl border border-border-main cursor-zoom-in hover:opacity-90 transition shrink-0"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                  No images uploaded
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 rounded-xl p-5 border border-border-main">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Core Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-text-muted block text-xs">
                        Category
                      </span>
                      <span className="font-medium text-text-main">
                        {selectedProduct.categoryName}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-xs">
                        Condition
                      </span>
                      <span className="font-medium text-text-main capitalize">
                        {selectedProduct.condition}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-text-muted block text-xs">
                        Brand
                      </span>
                      <span className="font-medium text-text-main">
                        {selectedProduct.brand || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-xs">
                        Model
                      </span>
                      <span className="font-medium text-text-main">
                        {selectedProduct.modelNumber || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Pricing
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-primary-700 block text-xs">
                      Starting Price
                    </span>
                    <span className="font-bold text-primary-950 text-xl">
                      ৳{selectedProduct.startingPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-primary-700 block text-xs">
                      Buyout Price
                    </span>
                    <span className="font-bold text-primary-950 text-xl">
                      ৳{selectedProduct.buyoutPrice?.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-primary-700 mt-2 bg-surface/60 p-2 rounded border border-primary-200">
                    Seller deposit required:{" "}
                    <strong>
                      ৳{(selectedProduct.startingPrice * 0.25).toFixed(2)}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border-main p-5">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Description & History
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-text-muted block text-xs mb-1">
                    Full Description
                  </span>
                  <p className="text-text-main whitespace-pre-wrap">
                    {selectedProduct.description}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted block text-xs mb-1">
                    Known Issues / Defects
                  </span>
                  <p className="text-danger-700 bg-danger-50 p-2 rounded border border-danger-100">
                    {selectedProduct.knownIssues || "None reported."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-surface border-t border-border-main px-6 py-4 rounded-b-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Approved" ? "border-success-500 bg-success-50" : "border-border-main hover:border-neutral-300"}`}
                >
                  <input
                    type="radio"
                    value="Approved"
                    {...register("status")}
                    className="hidden"
                  />
                  <CheckCircle2
                    className={`w-5 h-5 ${actionStatus === "Approved" ? "text-success-600" : "text-neutral-400"}`}
                  />
                  <p
                    className={`text-sm font-bold ${actionStatus === "Approved" ? "text-success-800" : "text-text-main"}`}
                  >
                    Approve
                  </p>
                </label>
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Rejected" ? "border-danger-500 bg-danger-50" : "border-border-main hover:border-neutral-300"}`}
                >
                  <input
                    type="radio"
                    value="Rejected"
                    {...register("status")}
                    className="hidden"
                  />
                  <XCircle
                    className={`w-5 h-5 ${actionStatus === "Rejected" ? "text-danger-600" : "text-neutral-400"}`}
                  />
                  <p
                    className={`text-sm font-bold ${actionStatus === "Rejected" ? "text-danger-800" : "text-text-main"}`}
                  >
                    Reject
                  </p>
                </label>
              </div>

              {actionStatus === "Rejected" && (
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    {...register("reason", { required: "Reason is required" })}
                    placeholder="Explain why..."
                    className="w-full border border-border-main p-2.5 rounded-lg focus:ring-2 focus:ring-danger-500 outline-none h-20 text-sm"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 text-text-inverse text-sm font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 ${actionStatus === "Approved" ? "bg-success-600 hover:bg-success-700" : "bg-danger-600 hover:bg-danger-700"}`}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Submitting..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed Product"
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
