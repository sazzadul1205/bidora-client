import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getAllDisputes, startDisputeReview, resolveDispute } from "../../../services/adminApi";
import { Scale, PlayCircle } from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchDisputes = async () => {
    try {
      const res = await getAllDisputes();
      setDisputes(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getAllDisputes();
        if (mounted) setDisputes(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleStartReview = async (id) => {
    try {
      await startDisputeReview(id);
      fetchDisputes();
      toast.success("Review started successfully!");
    } catch {
      toast.error("Failed to start review.");
    }
  };

  const onSubmitResolve = async (data) => {
    try {
      await resolveDispute(selected.id, {
        faultType: data.faultType,
        adminDecision: data.adminDecision,
        applyPenalty: data.applyPenalty === "true",
      });
      setSelected(null);
      reset();
      fetchDisputes();
      toast.success("Dispute resolved successfully!");
    } catch (err) {
      toast.error("Failed to resolve dispute: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Sale ID</th>
              <th className="px-6 py-4 font-medium">Complaint</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <SkeletonRow cols={5} />
            <SkeletonRow cols={5} />
            <SkeletonRow cols={5} />
            <SkeletonRow cols={5} />
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Disputes</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Sale ID</th>
              <th className="px-6 py-4 font-medium">Complaint</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {disputes.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No disputes found.</td></tr>
            ) : disputes.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">#{d.id}</td>
                <td className="px-6 py-4">#{d.saleId}</td>
                <td className="px-6 py-4 truncate max-w-xs">{d.complaint}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    d.status === "Open" ? "bg-orange-100 text-orange-700" :
                    d.status === "UnderReview" ? "bg-blue-100 text-blue-700" :
                    d.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  {d.status === "Open" && (
                    <button onClick={() => handleStartReview(d.id)} className="text-orange-600 hover:text-orange-800 font-medium inline-flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" /> Start Review
                    </button>
                  )}
                  {(d.status === "Open" || d.status === "UnderReview") && (
                    <button onClick={() => { setSelected(d); reset(); }} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                      <Scale className="w-4 h-4" /> Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold mb-1">Resolve Dispute #{selected.id}</h2>
            <p className="text-sm text-gray-500 mb-4">Sale: #{selected.saleId}</p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
              <p><strong>Complaint:</strong> {selected.complaint}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitResolve)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fault Assignment</label>
                <select {...register("faultType")} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Buyer">Buyer is at fault</option>
                  <option value="Seller">Seller is at fault</option>
                  <option value="System">System error / No fault</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Decision & Notes</label>
                <textarea {...register("adminDecision", { required: true })} placeholder="Explain the resolution..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penalty Action</label>
                <select {...register("applyPenalty")} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="false">No Penalty</option>
                  <option value="true">Apply Penalty (Forfeit Deposit)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Submit Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}