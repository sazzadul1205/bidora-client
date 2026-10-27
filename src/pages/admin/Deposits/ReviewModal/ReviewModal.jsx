import { useForm, useWatch } from "react-hook-form";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  Loader2,
} from "lucide-react";
import { imageUrl, handleImageError } from "../../../../utils/image";
import { formatDateTime } from "../../../../utils/date";

export default function ReviewModal({
  selected,
  onClose,
  onSubmit,
  submitting,
}) {
 
  const { register, handleSubmit, control } = useForm({
    defaultValues: { status: "Approved" },
  });

  const actionStatus = useWatch({ control, name: "status" });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return formatDateTime(dateString);
  };

  const formatMoney = (amount) => {
    return `৳${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!selected) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Review Deposit</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Deposit ID: #{selected.id}
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
                <CreditCard className="w-4 h-4" /> Transaction Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs">
                    Payment Method
                  </span>
                  <span className="font-medium text-gray-900">
                    {selected.method === "BankTransfer"
                      ? "Bank Transfer"
                      : selected.method}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">
                    Amount Requested
                  </span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatMoney(selected.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">
                    Transaction Reference
                  </span>
                  <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded border inline-block mt-1">
                    {selected.transactionReference}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-blue-700 block text-xs">Wallet ID</span>
                  <span className="font-medium text-blue-950">
                    #{selected.walletId}
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
                <div>
                  <span className="text-blue-700 block text-xs">
                    Current Status
                  </span>
                  <span className="font-medium text-blue-950">
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Payment Receipt
            </h3>
            {selected.receiptImageUrl ? (
              <div className="w-full">
                <img
                  src={imageUrl(selected.receiptImageUrl)}
                  alt="Receipt"
                  onError={handleImageError}
                  onClick={() =>
                    window.open(imageUrl(selected.receiptImageUrl), "_blank")
                  }
                  className="w-full h-64 object-contain bg-gray-100 rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 transition"
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Click image to zoom
                </p>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                No receipt uploaded
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${actionStatus === "Approved" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <input
                  type="radio"
                  value="Approved"
                  {...register("status")}
                  className="hidden"
                />
                <CheckCircle2
                  className={`w-5 h-5 ${actionStatus === "Approved" ? "text-green-600" : "text-gray-400"}`}
                />
                <div>
                  <p
                    className={`text-sm font-bold ${actionStatus === "Approved" ? "text-green-800" : "text-gray-700"}`}
                  >
                    Approve
                  </p>
                  <p className="text-xs text-gray-500">Credit the wallet</p>
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
                  <p className="text-xs text-gray-500">Deny this deposit</p>
                </div>
              </label>
            </div>

            {actionStatus === "Rejected" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (Required)
                </label>
                <textarea
                  {...register("reason", {
                    required: "Reason is required for rejection.",
                  })}
                  placeholder="Explain why this deposit was rejected..."
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-20 text-sm"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2.5 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 ${actionStatus === "Approved" ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20" : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"}`}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting
                  ? "Submitting..."
                  : actionStatus === "Approved"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
