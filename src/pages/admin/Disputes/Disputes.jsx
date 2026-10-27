import { useEffect, useState } from "react";
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
  ShieldAlert,
  Calendar,
  Search,
  Package,
  Eye,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

// Import the extracted modals
import DetailsModal from "./DetailsModal/DetailsModal";
import ResolveModal from "./ResolveModal/ResolveModal";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Open");

  const fetchDisputes = async () => {
    try {
      const res = await getAllDisputes();
      setDisputes(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load disputes.");
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
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      d.saleId.toString().includes(searchTerm) ||
      d.raisedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.againstName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    return d.status === activeTab;
  });

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
                <th className="px-6 py-4 font-medium">Parties Involved</th>
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

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID or complaint..."
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
                <th className="px-6 py-4 font-medium w-[20%]">Dispute</th>
                <th className="px-6 py-4 font-medium w-[45%]">
                  Parties Involved
                </th>
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
                  </td>
                </tr>
              ) : (
                filteredDisputes.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          Dispute #{d.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Package className="w-3 h-3" /> Sale #{d.saleId}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {formatDate(d.createdAt)}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-gray-800">
                            {d.raisedByName}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${d.raisedByRole === "Buyer" ? "bg-blue-100 text-blue-700" : d.raisedByRole === "Seller" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}
                          >
                            {d.raisedByRole}
                          </span>
                          <span className="text-gray-400 font-medium">
                            raised against
                          </span>
                          <span className="font-semibold text-gray-800">
                            {d.againstName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1 italic">
                          "{d.complaint}"
                        </p>
                      </div>
                    </td>

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

                        {d.status === "UnderReview" && (
                          <button
                            onClick={() => setSelected(d)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                          >
                            <Scale className="w-3.5 h-3.5" /> Resolve
                          </button>
                        )}

                        {d.status === "Resolved" && (
                          <button
                            onClick={() => setViewDetailsTarget(d)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>
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

      {/* EXTRACTED MODALS */}
      <DetailsModal
        target={viewDetailsTarget}
        onClose={() => setViewDetailsTarget(null)}
      />

      <ResolveModal
        selected={selected}
        onClose={() => setSelected(null)}
        onSubmit={onSubmitResolve}
        submitting={submitting}
      />
    </div>
  );
}
