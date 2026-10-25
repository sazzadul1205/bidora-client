import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getAllAuctions, configureAuction, cancelAuction } from "../../../services/adminApi";
import { Loader2, Calendar, XCircle } from "lucide-react";
import { toast } from "../../../utils/toast";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const { register, handleSubmit, reset } = useForm();

  const fetchAuctions = async () => {
    try {
      const res = await getAllAuctions();
      setAuctions(res.data.data);
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
        const res = await getAllAuctions();
        if (mounted) setAuctions(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const openModal = (auction, type) => {
    setSelected(auction);
    setAction(type);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (action === "configure") {
        await configureAuction(selected.auctionId, {
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString()
        });
      } else {
        await cancelAuction(selected.auctionId, { reason: data.reason });
      }
      setSelected(null);
      fetchAuctions();
      toast.success(`Auction ${action === "configure" ? "configured" : "cancelled"} successfully!`);
    } catch (err) {
      toast.error("Action failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Auctions</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Product Title</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Start Time</th>
              <th className="px-6 py-4 font-medium">End Time</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auctions.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No auctions found.</td></tr>
            ) : auctions.map((a) => (
              <tr key={a.auctionId} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{a.productTitle}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    a.status === "Active" ? "bg-green-100 text-green-700" :
                    a.status === "Upcoming" ? "bg-yellow-100 text-yellow-700" :
                    a.status === "Completed" ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4">{a.startTime ? new Date(a.startTime).toLocaleString() : "Not set"}</td>
                <td className="px-6 py-4">{a.endTime ? new Date(a.endTime).toLocaleString() : "Not set"}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  {a.status === "Upcoming" && (
                    <button onClick={() => openModal(a, "configure")} className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Configure
                    </button>
                  )}
                  {(a.status === "Upcoming" || a.status === "Active") && (
                    <button onClick={() => openModal(a, "cancel")} className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Cancel
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
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4 capitalize">{action} Auction</h2>
            <p className="text-sm text-gray-500 mb-4">Product: {selected.productTitle}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {action === "configure" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (Local)</label>
                    <input type="datetime-local" {...register("startTime", { required: true })} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Local)</label>
                    <input type="datetime-local" {...register("endTime", { required: true })} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation</label>
                  <textarea {...register("reason", { required: true })} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Provide a reason..." />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}