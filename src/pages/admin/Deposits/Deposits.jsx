import { useEffect, useState } from "react";
import {
  getPendingDepositRequests,
  reviewDepositRequest,
} from "../../../services/adminApi";
import { CheckCircle2, CreditCard, Hash, Receipt, Wallet } from "lucide-react";
import { formatDateTime } from "../../../utils/date";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

// Import the extracted modal
import ReviewModal from "./ReviewModal/ReviewModal";

export default function Deposits() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    const status = data.status;

    try {
      await reviewDepositRequest(selected.id, {
        Status: status,
        RejectionReason: status === "Rejected" ? data.reason : null,
      });

      setSelected(null);
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
                      onClick={() => setSelected(r)}
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


      <ReviewModal
        selected={selected}
        onClose={() => setSelected(null)}
        onSubmit={onSubmit}
        submitting={submitting}
      />
    </div>
  );
}
