import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  getPendingDepositRequests,
  reviewDepositRequest,
} from "../../../services/adminApi";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  Receipt,
  Hash,
  Loader2,
  Wallet,
} from "lucide-react";
import { formatDateTime } from "../../../utils/date";
import { toast } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Deposits() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const { register, handleSubmit, reset, control } = useForm();
  const actionStatus = useWatch({
    control,
    name: "status",
    defaultValue: "Approved",
  });

  const fetchRequests = async () => {
    try {
      const res = await getPendingDepositRequests();
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPendingDepositRequests();
        if (mounted) setRequests(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const status = actionStatus || "Approved";

    try {
      await reviewDepositRequest(selected.id, {
        Status: status,
        RejectionReason: status === "Rejected" ? data.reason : null,
      });

      setSelected(null);
      reset();
      fetchRequests();
      toast.success(
        `Deposit ${status === "Approved" ? "approved" : "rejected"} successfully!`,
      );
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let detail = serverMsg || "Error reviewing deposit.";
      if (validationErrors) {
        detail = Object.values(validationErrors).flat().join(" ");
      }
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeposit = (r) => {
    setSelected(r);
    reset();
  };

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

  // --- LOADING STATE ---
  if (loading)
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Reference</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
            </tbody>
          </table>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Deposits</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve manual deposit requests from users.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          {requests.length} Pending
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Method</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Reference</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">All caught up!</p>
                  <p className="text-gray-400 text-xs mt-1">
                    No pending deposit requests at the moment.
                  </p>
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {r.method === "BankTransfer"
                          ? "Bank Transfer"
                          : r.method}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-green-600 text-base">
                      {formatMoney(r.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600 font-mono text-xs">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      {r.transactionReference}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openDeposit(r)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      {/* REVIEW MODAL */}
      
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Review Deposit
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Deposit ID: #{selected.id}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 flex-1 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction Info Card */}
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

                {/* Metadata Card */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Metadata
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-blue-700 block text-xs">
                        Wallet ID
                      </span>
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

              {/* Receipt Image */}
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
                        setZoomImage(imageUrl(selected.receiptImageUrl))
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

            {/* Sticky Footer - Decision */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Custom Radio Buttons for Decision */}
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

                {/* Rejection Reason (conditional) */}
                {actionStatus === "Rejected" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason (Required)
                    </label>
                    <textarea
                      {...register("reason", {
                        required: "Reason is required for rejection.",
                      })}
                      placeholder="Explain why this deposit was rejected (e.g., invalid reference, blurry receipt)..."
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-20 text-sm"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2.5 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      actionStatus === "Approved"
                        ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20"
                        : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                    }`}
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
      )}

      {/* IMAGE ZOOM OVERLAY */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed Receipt"
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
