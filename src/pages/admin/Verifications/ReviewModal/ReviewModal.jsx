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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!selected) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Review Verification
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Applicant ID: #{selected.id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Personal Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">
                      Full Name
                    </span>
                    <span className="font-medium text-gray-900">
                      {selected.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Role</span>
                    <span
                      className={`font-medium inline-block px-2 py-0.5 rounded-full text-xs ${selected.role === "Seller" ? "bg-purple-50 text-purple-700" : "bg-indigo-50 text-indigo-700"}`}
                    >
                      {selected.role || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Phone</span>
                    <span className="font-medium text-gray-900">
                      {selected.phoneNumber || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Address</span>
                    <span className="font-medium text-gray-900">
                      {selected.address || "Not provided"},{" "}
                      {selected.city || ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Identity
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-blue-700 block text-xs">
                      National ID Number
                    </span>
                    <span className="font-medium text-blue-950">
                      {selected.nationalIdNumber || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700 block text-xs">
                      Submitted On
                    </span>
                    <span className="font-medium text-blue-950 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{" "}
                      {formatDate(selected.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                National ID Images
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  selected.nationalIdFrontImageUrl,
                  selected.nationalIdBackImageUrl,
                ].map((url, i) => (
                  <div key={i}>
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      {i === 0 ? "Front of ID" : "Back of ID"}
                    </p>
                    {url ? (
                      <img
                        src={imageUrl(url)}
                        alt="ID"
                        onError={handleImageError}
                        onClick={() => setZoomImage(imageUrl(url))}
                        className="w-full h-48 object-contain bg-gray-100 rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 transition"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Not Uploaded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Verified" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    value="Verified"
                    {...register("status")}
                    className="hidden"
                  />
                  <CheckCircle2
                    className={`w-5 h-5 ${actionStatus === "Verified" ? "text-green-600" : "text-gray-400"}`}
                  />
                  <div>
                    <p
                      className={`text-sm font-bold ${actionStatus === "Verified" ? "text-green-800" : "text-gray-700"}`}
                    >
                      Approve
                    </p>
                  </div>
                </label>
                <label
                  className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Rejected" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    value="Rejected"
                    {...register("status")}
                    className="hidden"
                  />
                  <XCircle
                    className={`w-5 h-5 ${actionStatus === "Rejected" ? "text-red-600" : "text-gray-400"}`}
                  />
                  <div>
                    <p
                      className={`text-sm font-bold ${actionStatus === "Rejected" ? "text-red-800" : "text-gray-700"}`}
                    >
                      Reject
                    </p>
                  </div>
                </label>
              </div>

              {actionStatus === "Rejected" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason (Required)
                  </label>
                  <textarea
                    {...register("reason", { required: "Reason is required" })}
                    placeholder="Explain why..."
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-20 text-sm"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 ${actionStatus === "Verified" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
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
