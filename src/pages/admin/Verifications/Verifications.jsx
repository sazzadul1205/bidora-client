import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  getPendingVerifications,
  verifyProfile,
} from "../../../services/adminApi";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { imageUrl, handleImageError } from "../../../utils/image";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Verifications() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const { register, handleSubmit, reset, control } = useForm();
  const actionStatus = useWatch({
    control,
    name: "status",
    defaultValue: "Verified",
  });

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
    const status = actionStatus || "Verified";
    const payload = {
      Status: status,
      RejectionReason: status === "Rejected" ? data.reason : null,
    };
    console.log("[VERIFY] Sending request RAW:", JSON.stringify({ profileId: selected.id, payload }, null, 2));
    try {
      const res = await verifyProfile(selected.id, payload);
      console.log("[VERIFY] Success response RAW:", JSON.stringify(res.data, null, 2));
      setSelected(null);
      reset();
      fetchProfiles();
      toast.success(
        `Profile ${status === "Verified" ? "verified" : "rejected"} successfully!`,
      );
    } catch (err) {
      console.log("[VERIFY] Error response RAW:", JSON.stringify({
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      }, null, 2));
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

  const openProfile = (p) => {
    setSelected(p);
    reset();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --- LOADING STATE ---
  if (loading)
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-44" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
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
    );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Profile Verifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and verify the National ID documents submitted by users.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {profiles.length} Pending
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
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
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.role === "Seller"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
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
                      onClick={() => openProfile(p)}
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

      {/* ========================================================= */}
      {/* REVIEW MODAL */}
      {/* ========================================================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
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
                {/* Personal Info Card */}
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
                      <span className="text-gray-500 block text-xs">
                        Role
                      </span>
                      <span
                        className={`font-medium inline-block px-2 py-0.5 rounded-full text-xs ${
                          selected.role === "Seller"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {selected.role || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">
                        Phone Number
                      </span>
                      <span className="font-medium text-gray-900">
                        {selected.phoneNumber || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">City</span>
                      <span className="font-medium text-gray-900">
                        {selected.city || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">
                        Address
                      </span>
                      <span className="font-medium text-gray-900">
                        {selected.address || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Identity Info Card */}
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

              {/* NID Images */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  National ID Images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Front of ID
                    </p>
                    {selected.nationalIdFrontImageUrl ? (
                      <img
                        src={imageUrl(selected.nationalIdFrontImageUrl)}
                        alt="Front ID"
                        onError={handleImageError}
                        onClick={() =>
                          setZoomImage(imageUrl(selected.nationalIdFrontImageUrl))
                        }
                        className="w-full h-48 object-contain bg-gray-100 rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 transition"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Not Uploaded
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Back of ID
                    </p>
                    {selected.nationalIdBackImageUrl ? (
                      <img
                        src={imageUrl(selected.nationalIdBackImageUrl)}
                        alt="Back ID"
                        onError={handleImageError}
                        onClick={() =>
                          setZoomImage(imageUrl(selected.nationalIdBackImageUrl))
                        }
                        className="w-full h-48 object-contain bg-gray-100 rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 transition"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Not Uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer - Decision */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Custom Radio Buttons for Decision */}
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
                      <p className="text-xs text-gray-500">Verify this user</p>
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
                      <p className="text-xs text-gray-500">
                        Deny this application
                      </p>
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
                      placeholder="Explain why this ID was rejected (e.g., blurry, expired, mismatched details)..."
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
                      actionStatus === "Verified"
                        ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20"
                        : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                    }`}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting
                      ? "Submitting..."
                      : actionStatus === "Verified"
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
            alt="Zoomed ID"
            onError={handleImageError}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
