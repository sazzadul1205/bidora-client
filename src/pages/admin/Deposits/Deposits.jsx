import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getPendingDepositRequests, reviewDepositRequest } from "../../../services/adminApi";
import { CheckCircle } from "lucide-react";
import { toast } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Deposits() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { register, handleSubmit, reset, control } = useForm();

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
    return () => { mounted = false; };
  }, []);

const onSubmit = async (data) => {
    try {
      const status = actionStatus || "Approved";
      await reviewDepositRequest(selected.id, {
        Status: status,
        RejectionReason: status === "Rejected" ? data.reason : null,
      });
      setSelected(null);
      reset();
      fetchRequests();
      toast.success(`Deposit ${status === "Approved" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let detail = serverMsg || "Error reviewing deposit: " + (err.message || "");
      if (validationErrors) {
        detail = Object.values(validationErrors).flat().join(" ");
      }
      toast.error(detail);
    }
  };

  const actionStatus = useWatch({ control, name: "status", defaultValue: "Approved" });

  if (loading) return (
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
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <SkeletonRow cols={4} />
            <SkeletonRow cols={4} />
            <SkeletonRow cols={4} />
            <SkeletonRow cols={4} />
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Deposits</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Method</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Reference</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8 text-gray-500">No pending deposits.</td></tr>
            ) : requests.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{r.method}</td>
                <td className="px-6 py-4 font-bold text-green-600">${r.amount.toLocaleString()}</td>
                <td className="px-6 py-4">{r.transactionReference}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setSelected(r); reset(); }} className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 w-full">
                    <CheckCircle className="w-4 h-4" /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Review Deposit</h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
              <p className="mb-1"><strong>Amount:</strong> ${selected.amount}</p>
              <p className="mb-1"><strong>Method:</strong> {selected.method}</p>
              <p><strong>Ref:</strong> {selected.transactionReference}</p>
            </div>

            {selected.receiptImageUrl && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Receipt Image</p>
                <img src={imageUrl(selected.receiptImageUrl)} alt="Receipt" onError={handleImageError} className="w-full h-48 object-contain bg-gray-100 rounded-lg border" />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <select {...register("status")} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Approved">Approve Deposit</option>
                <option value="Rejected">Reject Deposit</option>
              </select>

              {actionStatus === "Rejected" && (
                <textarea {...register("reason", { required: true })} placeholder="Rejection reason..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20" />
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}