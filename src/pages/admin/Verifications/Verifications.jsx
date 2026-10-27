import { useEffect, useState } from "react";
import {
  getPendingVerifications,
  verifyProfile,
} from "../../../services/adminApi";
import { ShieldCheck, Phone, MapPin } from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

import ReviewModal from "./ReviewModal/ReviewModal";

export default function Verifications() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

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
    (async () => {
      try {
        const res = await getPendingVerifications();
        if (mounted) setProfiles(res.data.data);
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
    const payload = {
      Status: status,
      RejectionReason: status === "Rejected" ? data.reason : null,
    };

    try {
      await verifyProfile(selected.id, payload);
      setSelected(null);
      fetchProfiles();
      toast.success(
        `Profile ${status === "Verified" ? "verified" : "rejected"} successfully!`,
      );
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let detail = serverMsg || "Error verifying profile.";
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
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading)
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-44" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-175">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-medium">Applicant</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Submission Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Profile Verifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and verify the National ID documents submitted by users.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          {profiles.length} Pending
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-175">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Submission Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">All caught up!</p>
                    <p className="text-gray-400 text-xs mt-1">
                      No pending verifications at the moment.
                    </p>
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {p.fullName}
                      </div>
                      <div className="text-xs text-gray-500">ID: #{p.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${p.role === "Seller" ? "bg-purple-50 text-purple-700" : "bg-indigo-50 text-indigo-700"}`}
                      >
                        {p.role || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{p.phoneNumber || "No phone"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{p.city || "No city"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelected(p)}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewModal
        selected={selected}
        onClose={() => setSelected(null)}
        onSubmit={onSubmit}
        submitting={submitting}
        zoomImage={zoomImage}
        setZoomImage={setZoomImage}
      />
    </div>
  );
}
