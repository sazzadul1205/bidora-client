import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  getAllDisputes,
  startDisputeReview,
  resolveDispute,
} from "../../../services/adminApi";
import {
  Scale,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldAlert,
  FileText,
  Link as LinkIcon,
  Calendar,
  Search,
  X,
  Loader2,
  Package,
  DollarSign,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Open");

  const { register, handleSubmit, reset, control } = useForm();
  const applyPenalty = useWatch({
    control,
    name: "applyPenalty",
    defaultValue: "false",
  });
  const faultType = useWatch({
    control,
    name: "faultType",
    defaultValue: "Buyer",
  });

  const fetchDisputes = async () => {
    try {
      const res = await getAllDisputes();
      setDisputes(res.data.data || []);
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
        const res = await getAllDisputes();
        if (mounted) setDisputes(res.data.data || []);
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

  const handleStartReview = async (id) => {
    try {
      await startDisputeReview(id);
      fetchDisputes();
      toast.success("Dispute moved to Under Review");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start review.");
    }
  };

  const onSubmitResolve = async (data) => {
    setSubmitting(true);
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
      const validationErrors = err.response?.data?.errors;
      let detail = err.response?.data?.message || "Failed to resolve dispute.";
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

  // --- STATS ---
  const openCount = disputes.filter((d) => d.status === "Open").length;
  const reviewingCount = disputes.filter(
    (d) => d.status === "UnderReview",
  ).length;
  const resolvedCount = disputes.filter((d) => d.status === "Resolved").length;

  // --- FILTERING ---
  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch =
      d.complaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toString().includes(searchTerm) ||
      d.saleId.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    return d.status === activeTab;
  });

  // --- LOADING ---
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Dispute</th>
                <th className="px-6 py-4 font-medium">Complaint</th>
                <th className="px-6 py-4 font-medium">Status</th>
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
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" /> Dispute Resolution
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review complaints, assign fault, and apply penalties.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg shrink-0 ${openCount > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"}`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Open Disputes</p>
            <p className="text-2xl font-bold text-gray-900">{openCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg shrink-0 ${reviewingCount > 0 ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"}`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Under Review</p>
            <p className="text-2xl font-bold text-gray-900">{reviewingCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {["Open", "UnderReview", "Resolved", "All"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "UnderReview" ? "Under Review" : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or complaint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-200">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Dispute</th>
                <th className="px-6 py-4 font-medium w-[35%]">Complaint</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDisputes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No disputes found.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      All caught up in this category!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* ID & Sale */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          Dispute #{d.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Package className="w-3 h-3" /> Sale #{d.saleId} ·
                          Product #{d.productId}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {formatDate(d.createdAt)}
                        </p>
                      </div>
                    </td>

                    {/* Complaint Preview */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                        "{d.complaint}"
                      </p>
{d.evidenceUrl && (
  <button
    type="button"
    onClick={() => window.open(d.evidenceUrl, "_blank")}
    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 mt-1 font-medium"
  >
    <LinkIcon className="w-3 h-3" /> View Evidence
  </button>
)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {d.status === "Open" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Open
                        </span>
                      )}
                      {d.status === "UnderReview" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <ShieldAlert className="w-3.5 h-3.5" /> Under Review
                        </span>
                      )}
                      {d.status === "Resolved" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {d.status === "Open" && (
                          <button
                            onClick={() => handleStartReview(d.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Start Review
                          </button>
                        )}
                        {(d.status === "Open" ||
                          d.status === "UnderReview") && (
                          <button
                            onClick={() => {
                              setSelected(d);
                              reset();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                          >
                            <Scale className="w-3.5 h-3.5" /> Resolve
                          </button>
                        )}
                        {d.status === "Resolved" && (
                          <span className="text-xs text-gray-400 font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RESOLVE MODAL */}
      {/* ========================================================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" /> Resolve Dispute #
                  {selected.id}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sale #{selected.saleId} · Product #{selected.productId}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Complaint Details Card */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Complaint Details
                  </h3>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-100">
                  "{selected.complaint}"
                </p>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Raised By</p>
                    <p className="font-mono text-xs text-gray-900 bg-white p-1.5 rounded border">
                      {selected.raisedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                </div>

                {selected.evidenceUrl && (
                  <div className="mt-4">
                    <a
                      href={selected.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" /> Open Evidence (
                      {new URL(selected.evidenceUrl).hostname})
                    </a>
                  </div>
                )}
              </div>

              {/* Resolution Form */}
              <form
                onSubmit={handleSubmit(onSubmitResolve)}
                className="space-y-5"
              >
                {/* Fault Assignment */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Who is at fault?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label
                      className={`cursor-pointer border-2 rounded-xl p-3 text-center transition ${faultType === "Buyer" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        value="Buyer"
                        {...register("faultType")}
                        className="hidden"
                      />
                      <User
                        className={`w-5 h-5 mx-auto mb-1 ${faultType === "Buyer" ? "text-red-600" : "text-gray-400"}`}
                      />
                      <p
                        className={`text-xs font-bold ${faultType === "Buyer" ? "text-red-800" : "text-gray-700"}`}
                      >
                        Buyer
                      </p>
                    </label>
                    <label
                      className={`cursor-pointer border-2 rounded-xl p-3 text-center transition ${faultType === "Seller" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        value="Seller"
                        {...register("faultType")}
                        className="hidden"
                      />
                      <Package
                        className={`w-5 h-5 mx-auto mb-1 ${faultType === "Seller" ? "text-red-600" : "text-gray-400"}`}
                      />
                      <p
                        className={`text-xs font-bold ${faultType === "Seller" ? "text-red-800" : "text-gray-700"}`}
                      >
                        Seller
                      </p>
                    </label>
                    <label
                      className={`cursor-pointer border-2 rounded-xl p-3 text-center transition ${faultType === "System" ? "border-gray-500 bg-gray-100" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        value="System"
                        {...register("faultType")}
                        className="hidden"
                      />
                      <ShieldAlert
                        className={`w-5 h-5 mx-auto mb-1 ${faultType === "System" ? "text-gray-800" : "text-gray-400"}`}
                      />
                      <p
                        className={`text-xs font-bold ${faultType === "System" ? "text-gray-900" : "text-gray-700"}`}
                      >
                        System
                      </p>
                    </label>
                  </div>
                </div>

                {/* Admin Decision */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Admin Decision & Reasoning{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("adminDecision", {
                      required: "Admin decision is required",
                      minLength: {
                        value: 10,
                        message: "Please provide more detail (min 10 chars)",
                      },
                    })}
                    placeholder="Explain the resolution outcome clearly. This will be visible to both parties."
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none text-sm"
                  />
                </div>

                {/* Penalty Toggle */}
                <div
                  className={`rounded-xl border-2 p-4 transition ${applyPenalty === "true" ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign
                        className={`w-5 h-5 ${applyPenalty === "true" ? "text-red-600" : "text-gray-400"}`}
                      />
                      <label className="text-sm font-bold text-gray-900">
                        Apply Deposit Penalty?
                      </label>
                    </div>
                    <select
                      {...register("applyPenalty")}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold bg-white focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="false">No Penalty</option>
                      <option value="true">Apply Penalty</option>
                    </select>
                  </div>
                  {applyPenalty === "true" ? (
                    <div className="flex items-start gap-2 mt-2 text-xs text-red-700">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        The forfeited deposit will be split:{" "}
                        <strong>80% to the opposite party</strong> and{" "}
                        <strong>20% to the platform</strong>. This action cannot
                        be undone.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 mt-1">
                      No financial penalty will be applied. Escrow funds will be
                      refunded based on the fault type.
                    </p>
                  )}
                </div>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Important:</strong> Once resolved, the dispute is
                    final. The sale will be marked as "Refunded", the product as
                    "Unavailable", and all reservations will be released.
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${
                      applyPenalty === "true"
                        ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                        : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                    }`}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Resolving..." : "Submit Resolution"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
