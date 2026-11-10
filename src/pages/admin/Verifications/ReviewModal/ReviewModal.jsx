import { useForm, useWatch } from "react-hook-form";
import {
  XCircle,
  User,
  CreditCard,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { imageUrl, handleImageError } from "../../../../utils/image";

export default function ReviewModal({
  selected,
  onClose,
  onSubmit,
  submitting,
  zoomImage,
  setZoomImage,
}) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { status: "Verified" },
  });
  const actionStatus = useWatch({ control, name: "status" });

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!selected) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
          <div className="sticky top-0 bg-surface border-b border-border-main px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-text-main">
                Review Verification
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Applicant ID: #{selected.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-100 rounded-lg"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 rounded-xl p-5 border border-border-main">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Personal Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-text-muted block text-xs">
                      Full Name
                    </span>
                    <span className="font-medium text-text-main">
                      {selected.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs">Role</span>
                    <span
                      className={`font-medium inline-block px-2 py-0.5 rounded-full text-xs ${selected.role === "Seller" ? "bg-accent-50 text-accent-700" : "bg-primary-50 text-primary-700"}`}
                    >
                      {selected.role || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs">Phone</span>
                    <span className="font-medium text-text-main">
                      {selected.phoneNumber || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs">
                      Address
                    </span>
                    <span className="font-medium text-text-main">
                      {selected.address || "Not provided"},{" "}
                      {selected.city || ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Identity
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-primary-700 block text-xs">
                      National ID Number
                    </span>
                    <span className="font-medium text-primary-950">
                      {selected.nationalIdNumber || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-primary-700 block text-xs">
                      Submitted On
                    </span>
                    <span className="font-medium text-primary-950 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{" "}
                      {formatDate(selected.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-main uppercase tracking-wider mb-4">
                National ID Images
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  selected.nationalIdFrontImageUrl,
                  selected.nationalIdBackImageUrl,
                ].map((url, i) => (
                  <div key={i}>
                    <p className="text-xs font-medium text-text-muted mb-2">
                      {i === 0 ? "Front of ID" : "Back of ID"}
                    </p>
                    {url ? (
                      <img
                        src={imageUrl(url)}
                        alt="ID"
                        onError={handleImageError}
                        onClick={() => setZoomImage(imageUrl(url))}
                        className="w-full h-48 object-contain bg-neutral-100 rounded-lg border border-border-main cursor-zoom-in hover:opacity-90 transition"
                      />
                    ) : (
                      <div className="w-full h-48 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm">
                        Not Uploaded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-surface border-t border-border-main px-6 py-4 rounded-b-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Verified" ? "border-success-500 bg-success-50" : "border-border-main hover:border-neutral-300"}`}
                >
                  <input
                    type="radio"
                    value="Verified"
                    {...register("status")}
                    className="hidden"
                  />
                  <CheckCircle2
                    className={`w-5 h-5 ${actionStatus === "Verified" ? "text-success-600" : "text-neutral-400"}`}
                  />
                  <p
                    className={`text-sm font-bold ${actionStatus === "Verified" ? "text-success-800" : "text-text-main"}`}
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
                <div className="animate-in fade-in slide-in-from-top-2">
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
                  className={`px-6 py-2.5 text-text-inverse text-sm font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 ${actionStatus === "Verified" ? "bg-success-600 hover:bg-success-700" : "bg-danger-600 hover:bg-danger-700"}`}
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
            alt="Zoomed ID"
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
