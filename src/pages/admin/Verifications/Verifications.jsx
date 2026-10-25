import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getPendingVerifications, verifyProfile } from "../../../services/adminApi";
import { ShieldCheck } from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Verifications() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { register, handleSubmit, reset, control } = useForm();

  const fetchProfiles = async () => {
    try {
      const res = await getPendingVerifications();
      setProfiles(res.data.data);
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
        const res = await getPendingVerifications();
        if (mounted) setProfiles(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data) => {
    try {
      await verifyProfile(selected.id, {
        status: data.status,
        rejectionReason: data.status === "Rejected" ? data.reason : null,
      });
      setSelected(null);
      reset();
      fetchProfiles();
      toast.success(`Profile ${data.status === "Verified" ? "verified" : "rejected"} successfully!`);
    } catch {
      toast.error("Error verifying profile.");
    }
  };

  const actionStatus = useWatch({ control, name: "status", defaultValue: "Verified" });

  if (loading) return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-44" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Full Name</th>
              <th className="px-6 py-4 font-medium">National ID</th>
              <th className="px-6 py-4 font-medium">Submission Date</th>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Verifications</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Full Name</th>
              <th className="px-6 py-4 font-medium">National ID</th>
              <th className="px-6 py-4 font-medium">Submission Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profiles.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8 text-gray-500">No pending verifications.</td></tr>
            ) : profiles.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{p.fullName}</td>
                <td className="px-6 py-4">{p.nationalIdNumber}</td>
                <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setSelected(p); reset(); }} className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 w-full">
                    <ShieldCheck className="w-4 h-4" /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold mb-4">Verify: {selected.fullName}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {selected.nationalIdFrontImageUrl ? (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Front ID</p>
                  <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${selected.nationalIdFrontImageUrl}`} alt="Front ID" className="w-full h-32 object-cover rounded-lg border" />
                </div>
              ) : null}
              {selected.nationalIdBackImageUrl ? (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Back ID</p>
                  <img src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${selected.nationalIdBackImageUrl}`} alt="Back ID" className="w-full h-32 object-cover rounded-lg border" />
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <select {...register("status")} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Verified">Approve & Verify</option>
                <option value="Rejected">Reject Verification</option>
              </select>

              {actionStatus === "Rejected" && (
                <textarea {...register("reason", { required: true })} placeholder="Rejection reason..." className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20" />
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Submit Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}